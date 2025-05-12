
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Invoice, Patient } from '@/types';

export const invoiceExportService = {
  /**
   * Génère un fichier XLSX pour un récapitulatif comptable
   * @param invoices Liste des factures à exporter
   * @param patientDataMap Map des données patients associées aux factures
   * @param period Période concernée (mois-année ou année)
   * @returns Blob du fichier XLSX généré
   */
  async generateAccountingExport(
    invoices: Invoice[],
    patientDataMap: Map<number, Patient>,
    period: string
  ): Promise<Blob> {
    // Création du workbook et de la feuille
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Récapitulatif comptable');
    
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
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FF000000' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFECF0F1' }
    };
    
    // Tri des factures par date
    const sortedInvoices = [...invoices].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Ajout des données
    sortedInvoices.forEach(invoice => {
      const patient = patientDataMap.get(invoice.patientId);
      const patientName = patient 
        ? `${patient.lastName} ${patient.firstName}`
        : `Patient #${invoice.patientId}`;
        
      worksheet.addRow({
        date: format(new Date(invoice.date), 'dd/MM/yyyy'),
        number: invoice.id.toString().padStart(4, '0'),
        patient: patientName,
        amount: invoice.amount,
        paymentMethod: invoice.paymentMethod || 'Non spécifié',
        status: this.translatePaymentStatus(invoice.paymentStatus),
        notes: invoice.notes || ''
      });
    });
    
    // Formatage des cellules de montant
    worksheet.getColumn('amount').numFmt = '0.00 €';
    
    // Ajout du total
    const totalRow = worksheet.rowCount + 2;
    worksheet.getCell(`C${totalRow}`).value = 'TOTAL';
    worksheet.getCell(`C${totalRow}`).font = { bold: true };
    
    worksheet.getCell(`D${totalRow}`).value = {
      formula: `SUM(D2:D${worksheet.rowCount})`,
      date1904: false
    };
    worksheet.getCell(`D${totalRow}`).numFmt = '0.00 €';
    worksheet.getCell(`D${totalRow}`).font = { bold: true };
    
    // Ajout d'informations sur la période
    worksheet.getCell('A1').value = `Récapitulatif comptable - ${period}`;
    worksheet.getCell('A1').font = { size: 14, bold: true };
    
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
