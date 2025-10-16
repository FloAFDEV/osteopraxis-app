/**
 * Générateur de PDF pour les notes d'honoraires
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Invoice, Patient, Osteopath, Cabinet } from '@/types';
import { exportSecurity } from '@/utils/export-utils';

/**
 * Génère un PDF à partir d'un élément HTML (note d'honoraire)
 */
export async function generateInvoicePDF(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Sécuriser le PDF
    const pdfBytes = pdf.output('arraybuffer');
    const securedPdfBytes = await exportSecurity.securePDF(new Uint8Array(pdfBytes));

    // Télécharger le fichier
    const blob = new Blob([new Uint8Array(securedPdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
}

/**
 * Génère le nom de fichier pour une note d'honoraire
 */
export function generateInvoiceFilename(
  invoice: Invoice,
  patient?: Patient | null
): string {
  const invoiceNumber = invoice.id.toString().padStart(4, '0');
  const patientName = patient 
    ? `${patient.lastName}_${patient.firstName}`.replace(/[^a-zA-Z0-9_-]/g, '_')
    : 'Patient';
  const date = new Date(invoice.date).toISOString().split('T')[0];
  
  return `Note_honoraire_${invoiceNumber}_${patientName}_${date}.pdf`;
}
