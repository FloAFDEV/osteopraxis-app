
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Invoice, Patient, Osteopath } from '@/types';

export const invoiceExportService = {
  /**
   * Génère un fichier XLSX pour un récapitulatif comptable
   * @param invoices Liste des factures à exporter
   * @param patientDataMap Map des données patients associées aux factures
   * @param period Période concernée (mois-année ou année)
   * @param osteopath Données de l'ostéopathe
   * @returns Blob du fichier XLSX généré
   */
  async generateAccountingExport(
    invoices: Invoice[],
    patientDataMap: Map<number, Patient>,
    period: string,
    osteopath?: Osteopath
  ): Promise<Blob> {
    // Création du workbook et de la feuille
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Récapitulatif comptable');
    
    // Configuration de la mise en page
    worksheet.properties.defaultRowHeight = 20;
    worksheet.pageSetup.paperSize = 9; // A4
    worksheet.pageSetup.orientation = 'landscape';
    worksheet.pageSetup.fitToPage = true;
    
    // Ajout de l'en-tête avec infos de l'ostéopathe
    if (osteopath) {
      // Logo et titre
      worksheet.mergeCells('A1:G1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `RÉCAPITULATIF COMPTABLE - ${period.toUpperCase()}`;
      titleCell.font = { 
        name: 'Arial',
        size: 18, 
        bold: true, 
        color: { argb: 'FF2E5984' }
      };
      titleCell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      worksheet.getRow(1).height = 30;
      
      // Info ostéopathe
      worksheet.mergeCells('A2:G2');
      const osteoCell = worksheet.getCell('A2');
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
      
      // Numéros ADELI/SIRET
      worksheet.mergeCells('A3:G3');
      const numCell = worksheet.getCell('A3');
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
      
      // Date d'édition
      worksheet.mergeCells('A4:G4');
      const dateCell = worksheet.getCell('A4');
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
      
      // Espace avant le tableau
      worksheet.addRow([]);
    } else {
      // Version simplifiée sans info ostéopathe
      worksheet.mergeCells('A1:G1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `Récapitulatif comptable - ${period}`;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: 'center' };
      worksheet.getRow(1).height = 30;
      
      // Espace avant le tableau
      worksheet.addRow([]);
    }
    
    // Détermine la ligne de début du tableau
    const headerRow = osteopath ? 6 : 3;
    
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
    const tableHeaderRow = worksheet.getRow(headerRow);
    tableHeaderRow.font = { 
      name: 'Arial', 
      bold: true, 
      color: { argb: 'FFFFFFFF' }
    };
    tableHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E5984' }
    };
    tableHeaderRow.alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    };
    tableHeaderRow.height = 24;
    
    // Appliquer une bordure au tableau
    tableHeaderRow.eachCell({ includeEmpty: true }, function(cell) {
      cell.border = {
        top: {style:'thin', color: {argb:'FFD0D0D0'}},
        left: {style:'thin', color: {argb:'FFD0D0D0'}},
        bottom: {style:'thin', color: {argb:'FFD0D0D0'}},
        right: {style:'thin', color: {argb:'FFD0D0D0'}}
      };
    });
    
    // Tri des factures par date
    const sortedInvoices = [...invoices].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Ajout des données
    let rowCounter = headerRow;
    sortedInvoices.forEach(invoice => {
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
        status: this.translatePaymentStatus(invoice.paymentStatus),
        notes: invoice.notes || ''
      });
      
      // Style pour les lignes de données
      row.eachCell({ includeEmpty: true }, function(cell) {
        cell.border = {
          top: {style:'thin', color: {argb:'FFD0D0D0'}},
          left: {style:'thin', color: {argb:'FFD0D0D0'}},
          bottom: {style:'thin', color: {argb:'FFD0D0D0'}},
          right: {style:'thin', color: {argb:'FFD0D0D0'}}
        };
        cell.font = { name: 'Arial', size: 10 };
        
        // Alignment spécifique par colonne
        if (cell.column === 1) { // Date
          cell.alignment = { horizontal: 'center' };
        } else if (cell.column === 2) { // Numéro
          cell.alignment = { horizontal: 'center' };
        } else if (cell.column === 4) { // Montant
          cell.alignment = { horizontal: 'right' };
        }
      });
      
      // Alternance de couleur pour les lignes
      if (rowCounter % 2 === 0) {
        row.eachCell({ includeEmpty: true }, function(cell) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F8FA' }
          };
        });
      }
    });
    
    // Formatage des cellules de montant
    worksheet.getColumn('amount').numFmt = '# ##0.00 €';
    
    // Ajout du total avec un style amélioré
    const totalRow = worksheet.rowCount + 2;
    
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
      formula: `SUM(D${headerRow+1}:D${worksheet.rowCount})`,
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
    footerCell.font = { 
      name: 'Arial',
      size: 8, 
      italic: true,
      color: { argb: 'FF888888' }
    };
    footerCell.alignment = { horizontal: 'center' };
    
    // Génération du fichier XLSX
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  },
  
  /**
   * Traduit les statuts de paiement en français
   */
  translatePaymentStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'En attente',
      'PAID': 'Payé',
      'CANCELLED': 'Annulé',
      'REFUNDED': 'Remboursé',
      'PARTIALLY_PAID': 'Partiellement payé'
    };
    
    return statusMap[status] || status;
  }
};
