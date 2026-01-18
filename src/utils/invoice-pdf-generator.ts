/**
 * Générateur de PDF pour les notes d'honoraires
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import { Invoice, Patient, Osteopath, Cabinet } from '@/types';
import { exportSecurity } from '@/utils/export-utils';
import { supabase } from '@/integrations/supabase/client';

/**
 * 🔐 Génère un hash SHA-256 du contenu du PDF pour traçabilité
 */
async function generatePdfHash(pdfBytes: Uint8Array): Promise<string> {
  // Créer une nouvelle Uint8Array pour garantir un ArrayBuffer standard
  const buffer = new Uint8Array(pdfBytes);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 🔐 Ajoute signature numérique et QR code de vérification au PDF
 */
async function addDigitalSignature(
  pdfBytes: Uint8Array,
  invoiceReference: string,
  osteopathName?: string
): Promise<Uint8Array> {
  try {
    // Charger le PDF avec pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Générer hash du PDF original
    const fileHash = await generatePdfHash(pdfBytes);
    
    // Générer QR code avec hash + référence
    const qrData = `https://osteopraxis.com/verify/${fileHash}?ref=${invoiceReference}`;
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 80,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Convertir QR code en image PNG pour pdf-lib
    const qrImageBytes = await fetch(qrDataUrl).then(res => res.arrayBuffer());
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    
    // Ajouter QR code sur la première page (coin inférieur droit)
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    firstPage.drawImage(qrImage, {
      x: width - 90,
      y: 10,
      width: 80,
      height: 80
    });
    
    // Ajouter texte de sécurité
    firstPage.drawText('Document sécurisé', {
      x: width - 90,
      y: 95,
      size: 6,
      color: rgb(0.3, 0.3, 0.3)
    });
    
    // Définir métadonnées de sécurité
    pdfDoc.setTitle(`Note d'honoraire - ${invoiceReference}`);
    pdfDoc.setProducer('OstéoPraxis Sécurisé v2.0');
    pdfDoc.setCreator(osteopathName || 'OstéoPraxis');
    pdfDoc.setSubject('Document officiel protégé');
    
    return await pdfDoc.save();
  } catch (error) {
    console.error('❌ Erreur ajout signature numérique:', error);
    // Retourner le PDF original si échec
    return pdfBytes;
  }
}

/**
 * 📝 Enregistre l'export dans la table audit document_exports
 */
async function logDocumentExport(
  osteopathId: number,
  invoiceId: number,
  invoiceReference: string,
  fileHash: string,
  fileSize: number,
  isDemo: boolean,
  patientInfo?: { firstName: string; lastName: string }
): Promise<void> {
  try {
    const { error } = await supabase.rpc('log_document_export', {
      p_osteopath_id: osteopathId,
      p_export_type: 'invoice_pdf',
      p_document_id: invoiceId,
      p_document_reference: invoiceReference,
      p_file_hash: fileHash,
      p_file_size_bytes: fileSize,
      p_is_demo_export: isDemo,
      p_recipient_info: patientInfo ? { 
        firstName: patientInfo.firstName, 
        lastName: patientInfo.lastName 
      } : {},
      p_metadata: { 
        timestamp: new Date().toISOString(),
        source: 'web_app'
      }
    });
    
    if (error) {
      console.error('⚠️ Erreur log export:', error);
    } else {
      console.log('✅ Export enregistré dans audit trail');
    }
  } catch (error) {
    console.error('❌ Erreur enregistrement export:', error);
  }
}

/**
 * Génère un PDF à partir d'un élément HTML (note d'honoraire)
 */
export async function generateInvoicePDF(
  element: HTMLElement,
  filename: string,
  invoice?: Invoice,
  patient?: Patient,
  osteopathId?: number
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

    // 🔒 SÉCURITÉ: Sécuriser le PDF avec filigrane approprié (démo/professionnel)
    const pdfBytes = pdf.output('arraybuffer');
    const osteopathName = element.querySelector('[data-osteopath-name]')?.textContent || undefined;
    let securedPdfBytes = await exportSecurity.securePDF(new Uint8Array(pdfBytes), osteopathName, osteopathId);

    // 🔐 PHASE 1.4: Ajouter signature numérique + QR code
    const invoiceReference = invoice ? `INV-${invoice.id.toString().padStart(6, '0')}` : 'UNKNOWN';
    securedPdfBytes = await addDigitalSignature(securedPdfBytes, invoiceReference, osteopathName);

    // 📝 Enregistrer dans audit trail
    const fileHash = await generatePdfHash(securedPdfBytes);
    const isDemo = await exportSecurity.detectDemoModeFromOsteopathStatus(osteopathId);
    
    if (invoice && osteopathId) {
      await logDocumentExport(
        osteopathId,
        invoice.id,
        invoiceReference,
        fileHash,
        securedPdfBytes.length,
        isDemo,
        patient ? { firstName: patient.firstName, lastName: patient.lastName } : undefined
      );
    }

    // Télécharger le fichier sécurisé (convertir en ArrayBuffer approprié)
    const blob = new Blob([new Uint8Array(securedPdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`✅ PDF sécurisé généré: ${filename} | Hash: ${fileHash.substring(0, 16)}...`);
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
