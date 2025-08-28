import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import ExcelJS from 'exceljs';
import { isDemoSession } from '@/utils/demo-detection';

/**
 * Utilitaires centralisés pour la sécurisation des exports en mode démo
 */

/**
 * Ajoute un filigrane de démonstration sur un PDF
 * @param pdfBytes Le PDF original en bytes
 * @returns Le PDF avec filigrane en bytes
 */
export async function addWatermarkDemo(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const pages = pdfDoc.getPages();
  
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    
    // Texte de filigrane
    const watermarkText = '⚠ MODE DÉMO — DONNÉES FICTIVES / NON VALABLES ⚠';
    
    // Calculer la taille de police adaptée à la page
    const fontSize = Math.min(width, height) * 0.06;
    
    // Ajouter le filigrane en diagonal (sans rotation car problème de typage)
    page.drawText(watermarkText, {
      x: width * 0.2,
      y: height * 0.5,
      size: fontSize,
      font: helveticaFont,
      color: rgb(1, 0, 0), // Rouge
      opacity: 0.3,
    });
    
    // Ajouter un second filigrane en diagonal à une autre position
    page.drawText(watermarkText, {
      x: width * 0.1,
      y: height * 0.7,
      size: fontSize * 0.8,
      font: helveticaFont,
      color: rgb(1, 0, 0), // Rouge
      opacity: 0.25,
    });
    
    // Ajouter un second filigrane plus petit en bas
    page.drawText('DOCUMENT DE DÉMONSTRATION', {
      x: width * 0.1,
      y: height * 0.1,
      size: fontSize * 0.6,
      font: helveticaFont,
      color: rgb(1, 0, 0),
      opacity: 0.4,
    });
  });
  
  return await pdfDoc.save();
}

/**
 * Ajoute un avertissement de démonstration à un workbook Excel
 * @param workbook Le workbook Excel original
 * @returns Le workbook modifié
 */
export async function addWatermarkDemoExcel(workbook: ExcelJS.Workbook): Promise<ExcelJS.Workbook> {
  // Ajouter un message d'avertissement sur chaque feuille existante
  workbook.eachSheet((worksheet) => {
    // Insérer une ligne en haut
    worksheet.insertRow(1, []);
    worksheet.insertRow(1, []);
    
    // Ajouter le message d'avertissement
    const warningCell = worksheet.getCell('A1');
    warningCell.value = '⚠ ATTENTION : DONNÉES DE DÉMONSTRATION - NON VALABLES POUR USAGE RÉEL ⚠';
    warningCell.font = { 
      bold: true, 
      color: { argb: 'FFFF0000' }, // Rouge
      size: 14 
    };
    warningCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFE6E6' } // Fond rouge clair
    };
    
    // Fusionner sur plusieurs colonnes pour visibilité
    worksheet.mergeCells('A1:H1');
    
    // Ajuster la hauteur de la ligne
    worksheet.getRow(1).height = 25;
  });
  
  // Créer une feuille README avec les avertissements
  const readmeSheet = workbook.addWorksheet('⚠ README - MODE DÉMO ⚠');
  
  const warnings = [
    '⚠ AVERTISSEMENT IMPORTANT ⚠',
    '',
    'Ce document a été généré en MODE DÉMONSTRATION.',
    '',
    '• Toutes les données contenues sont FICTIVES',
    '• Ce document n\'a AUCUNE valeur légale ou comptable',
    '• Il ne peut être utilisé comme justificatif officiel',
    '• Les patients et transactions sont générés automatiquement',
    '',
    'Pour obtenir des documents officiels :',
    '1. Créez un compte utilisateur réel',
    '2. Saisissez vos véritables données patients',
    '3. Générez les exports depuis votre compte authentifié',
    '',
    'PatientHub - Logiciel de gestion pour ostéopathes'
  ];
  
  warnings.forEach((text, index) => {
    const cell = readmeSheet.getCell(`A${index + 1}`);
    cell.value = text;
    
    if (index === 0) {
      cell.font = { bold: true, size: 16, color: { argb: 'FFFF0000' } };
    } else if (text.startsWith('•') || text.startsWith('1.') || text.startsWith('2.') || text.startsWith('3.')) {
      cell.font = { size: 12 };
    } else if (text.length > 0) {
      cell.font = { bold: true, size: 12 };
    }
  });
  
  // Ajuster la largeur des colonnes
  readmeSheet.getColumn('A').width = 60;
  
  return workbook;
}

/**
 * Génère un numéro de devis adapté au mode (démo ou connecté)
 * @param isDemo Mode démonstration ou non
 * @returns Numéro de devis formaté
 */
export function generateQuoteNumber(isDemo: boolean): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 chiffres aléatoires
  
  if (isDemo) {
    return `DEMO-Q-${year}-${randomNum}`;
  }
  
  return `Q-${year}-${randomNum}`;
}

/**
 * Hook/Service centralisé pour la gestion des exports sécurisés
 */
export class ExportSecurityService {
  private static instance: ExportSecurityService;
  private isDemo: boolean | null = null;
  
  public static getInstance(): ExportSecurityService {
    if (!ExportSecurityService.instance) {
      ExportSecurityService.instance = new ExportSecurityService();
    }
    return ExportSecurityService.instance;
  }
  
  /**
   * Détecte automatiquement si on est en mode démo
   */
  async detectDemoMode(): Promise<boolean> {
    if (this.isDemo !== null) {
      return this.isDemo;
    }
    
    this.isDemo = await isDemoSession();
    return this.isDemo;
  }
  
  /**
   * Force la réinitialisation de la détection du mode démo
   */
  resetDemoDetection(): void {
    this.isDemo = null;
  }
  
  /**
   * Sécurise un PDF selon le mode détecté
   * @param pdfBytes Le PDF original
   * @returns Le PDF sécurisé (avec filigrane si démo)
   */
  async securePDF(pdfBytes: Uint8Array): Promise<Uint8Array> {
    const isDemo = await this.detectDemoMode();
    
    if (isDemo) {
      return await addWatermarkDemo(pdfBytes);
    }
    
    return pdfBytes;
  }
  
  /**
   * Sécurise un Excel selon le mode détecté
   * @param workbook Le workbook original
   * @returns Le workbook sécurisé (avec avertissements si démo)
   */
  async secureExcel(workbook: ExcelJS.Workbook): Promise<ExcelJS.Workbook> {
    const isDemo = await this.detectDemoMode();
    
    if (isDemo) {
      return await addWatermarkDemoExcel(workbook);
    }
    
    return workbook;
  }
  
  /**
   * Génère un numéro de devis sécurisé selon le mode détecté
   * @returns Numéro de devis adapté
   */
  async generateSecureQuoteNumber(): Promise<string> {
    const isDemo = await this.detectDemoMode();
    return generateQuoteNumber(isDemo);
  }
}

/**
 * Instance globale du service de sécurisation des exports
 */
export const exportSecurity = ExportSecurityService.getInstance();