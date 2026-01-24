import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import ExcelJS from 'exceljs';
import { isDemoSession } from '@/utils/demo-detection';

/**
 * Utilitaires centralisés pour la sécurisation des exports en mode démo
 */

/**
 * Ajoute un filigrane professionnel sur un PDF
 * @param pdfBytes Le PDF original en bytes
 * @param osteopathName Nom de l'ostéopathe
 * @param isDemo Mode démonstration ou non
 * @returns Le PDF avec filigrane en bytes
 */
export async function addProfessionalWatermark(
  pdfBytes: Uint8Array, 
  osteopathName?: string, 
  isDemo: boolean = false
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const pages = pdfDoc.getPages();
  
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    
    if (isDemo) {
      // Filigrane de démonstration (mode démo) - Texte ASCII uniquement
      const demoText = '[!] MODE DEMO - DONNEES FICTIVES / NON VALABLES [!]';
      const fontSize = Math.min(width, height) * 0.06;
      
      page.drawText(demoText, {
        x: width * 0.2,
        y: height * 0.5,
        size: fontSize,
        font: helveticaFont,
        color: rgb(1, 0, 0), // Rouge
        opacity: 0.3,
      });
      
      page.drawText(demoText, {
        x: width * 0.1,
        y: height * 0.7,
        size: fontSize * 0.8,
        font: helveticaFont,
        color: rgb(1, 0, 0), // Rouge
        opacity: 0.25,
      });
      
      page.drawText('DOCUMENT DE DEMONSTRATION', {
        x: width * 0.1,
        y: height * 0.1,
        size: fontSize * 0.6,
        font: helveticaFont,
        color: rgb(1, 0, 0),
        opacity: 0.4,
      });
    } else {
      // Filigrane professionnel (mode connecté) - Texte ASCII uniquement
      const currentDate = new Date().toLocaleDateString('fr-FR');
      const confidentialText = 'DOCUMENT CONFIDENTIEL - NE PAS DIFFUSER';
      const exportText = `Exporte par ${osteopathName || 'Praticien'} le ${currentDate}`;
      
      const fontSize = Math.min(width, height) * 0.03; // Plus discret
      
      // Filigrane principal en diagonale
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Répétition du filigrane principal
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          const x = (width / 4) * (i + 1);
          const y = (height / 3) * (j + 1);
          
          page.drawText(confidentialText, {
            x: x - confidentialText.length * 2,
            y: y,
            size: fontSize,
            font: helveticaFont,
            color: rgb(0.8, 0.8, 0.8), // Gris clair
            opacity: 0.25,
          });
        }
      }
      
      // Filigrane avec informations d'export en bas de page
      page.drawText(exportText, {
        x: width * 0.1,
        y: height * 0.05,
        size: fontSize * 0.8,
        font: helveticaFont,
        color: rgb(0.7, 0.7, 0.7), // Gris
        opacity: 0.3,
      });
    }
  });
  
  return await pdfDoc.save();
}

/**
 * Ajoute un filigrane (démo ou professionnel) à un workbook Excel
 * @param workbook Le workbook Excel original
 * @param osteopathName Nom de l'ostéopathe
 * @param isDemo Mode démonstration ou non
 * @returns Le workbook modifié
 */
/**
 * Calcule le hash SHA-256 d'un workbook Excel
 * @param workbook Le workbook Excel
 * @returns Hash SHA-256 en hexadécimal
 */
async function calculateExcelHash(workbook: ExcelJS.Workbook): Promise<string> {
  const buffer = await workbook.xlsx.writeBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function addWatermarkExcel(
  workbook: ExcelJS.Workbook,
  osteopathName?: string,
  isDemo: boolean = false
): Promise<{ workbook: ExcelJS.Workbook; fileHash: string }> {
  if (isDemo) {
    // Mode démo : ajouter des avertissements visibles
    workbook.eachSheet((worksheet) => {
      // Vérifier si l'avertissement a déjà été ajouté
      const firstCell = worksheet.getCell('A1');
      const alreadyHasWarning = firstCell.value &&
        typeof firstCell.value === 'string' &&
        firstCell.value.includes('DEMONSTRATION');

      // Ne pas ajouter l'avertissement si déjà présent
      if (alreadyHasWarning) {
        return;
      }

      // Insérer une ligne en haut
      worksheet.insertRow(1, []);
      worksheet.insertRow(1, []);

      // Ajouter le message d'avertissement
      const warningCell = worksheet.getCell('A1');
      warningCell.value = '[!] ATTENTION : DONNEES DE DEMONSTRATION - NON VALABLES POUR USAGE REEL [!]';
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

      // Fusionner sur plusieurs colonnes pour visibilité (vérifier d'abord si pas déjà fusionné)
      try {
        worksheet.mergeCells('A1:H1');
      } catch (e) {
        // Cellules déjà fusionnées, ignorer
        console.log('Cellules déjà fusionnées, skip');
      }

      // Ajuster la hauteur de la ligne
      worksheet.getRow(1).height = 25;
    });
  } else {
    // Mode connecté : ajouter un filigrane discret
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const exportInfo = `Exporte par ${osteopathName || 'Praticien'} le ${currentDate}`;
    
    workbook.eachSheet((worksheet) => {
      // Ajouter une ligne discrète en bas avec les informations d'export
      const lastRow = worksheet.rowCount + 2;
      const exportCell = worksheet.getCell(`A${lastRow}`);
      exportCell.value = `Document confidentiel - ${exportInfo}`;
      exportCell.font = { 
        italic: true, 
        color: { argb: 'FF888888' }, // Gris
        size: 9 
      };
    });
  }
  
  if (isDemo) {
    // Créer une feuille README avec les avertissements
    const readmeSheet = workbook.addWorksheet('README - MODE DEMO');
  
  const warnings = [
    '[!] AVERTISSEMENT IMPORTANT [!]',
    '',
    'Ce document a été généré en MODE DÉMONSTRATION.',
    '',
      '• Toutes les donnees contenues sont FICTIVES',
      '• Ce document n\'a AUCUNE valeur legale ou comptable',
      '• Il ne peut etre utilise comme justificatif officiel',
      '• Les patients et transactions sont generes automatiquement',
    '',
      'Pour obtenir des documents officiels :',
      '1. Creez un compte utilisateur reel',
      '2. Saisissez vos veritables donnees patients',
      '3. Generez les exports depuis votre compte authentifie',
    '',
    'OstéoPraxis - Logiciel de gestion pour osteopathes'
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
  }
  
  // Calculer le hash SHA-256 du workbook AVANT de l'enregistrer
  const fileHash = await calculateExcelHash(workbook);
  
  // Ajouter le hash dans une feuille metadata (pour vérification ultérieure)
  const metadataSheet = workbook.addWorksheet('_Metadata');
  metadataSheet.state = 'veryHidden'; // Masquer la feuille
  metadataSheet.getCell('A1').value = 'SHA256_HASH';
  metadataSheet.getCell('B1').value = fileHash;
  metadataSheet.getCell('A2').value = 'GENERATED_AT';
  metadataSheet.getCell('B2').value = new Date().toISOString();
  metadataSheet.getCell('A3').value = 'GENERATED_BY';
  metadataSheet.getCell('B3').value = osteopathName || 'Praticien';
  
  return { workbook, fileHash };
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
   * Détecte le mode démo basé sur le statut de l'ostéopathe dans la base de données
   * @param osteopathId ID de l'ostéopathe (optionnel, sinon détecte depuis le contexte)
   * @returns true si l'ostéopathe est en mode demo, false si actif
   */
  async detectDemoModeFromOsteopathStatus(osteopathId?: number): Promise<boolean> {
    try {
      // Si pas d'ID fourni, vérifier d'abord la session démo locale
      if (!osteopathId) {
        const isDemoLocal = await isDemoSession();
        if (isDemoLocal) return true;
      }

      // Importer dynamiquement pour éviter les dépendances circulaires
      const { supabase } = await import('@/integrations/supabase/client');

      let osteoId = osteopathId;

      // Si pas d'ID fourni, récupérer depuis la session courante
      if (!osteoId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return true; // Pas d'utilisateur = mode démo

        const { data: userData } = await supabase
          .from('User')
          .select('osteopathId')
          .eq('id', user.id)
          .single();

        if (!userData?.osteopathId) return true; // Pas d'ostéopathe lié = mode démo
        osteoId = userData.osteopathId;
      }

      // Récupérer le statut de l'ostéopathe
      const { data: osteopathData, error } = await supabase
        .from('Osteopath')
        .select('status')
        .eq('id', osteoId)
        .single();

      if (error || !osteopathData) {
        console.warn('Impossible de récupérer le statut ostéopathe, mode démo par défaut');
        return true; // Par défaut, mode démo pour sécurité
      }

      // Mode démo si status = 'demo' ou 'blocked'
      return osteopathData.status !== 'active';
    } catch (error) {
      console.error('Erreur détection mode démo:', error);
      return true; // Par défaut, mode démo pour sécurité
    }
  }

  /**
   * Détecte automatiquement si on est en mode démo (méthode legacy)
   * DEPRECATED: Utiliser detectDemoModeFromOsteopathStatus à la place
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
   * Sécurise un PDF selon le mode détecté (basé sur le statut ostéopathe)
   * @param pdfBytes Le PDF original
   * @param osteopathName Nom de l'ostéopathe (optionnel)
   * @param osteopathId ID de l'ostéopathe (optionnel, sinon auto-détection)
   * @returns Le PDF sécurisé avec filigrane approprié
   */
  async securePDF(pdfBytes: Uint8Array, osteopathName?: string, osteopathId?: number): Promise<Uint8Array> {
    const isDemo = await this.detectDemoModeFromOsteopathStatus(osteopathId);
    return await addProfessionalWatermark(pdfBytes, osteopathName, isDemo);
  }

  /**
   * Sécurise un PDF selon le mode détecté (méthode legacy)
   * DEPRECATED: Utiliser securePDF avec osteopathId à la place
   */
  async securePDFLegacy(pdfBytes: Uint8Array, osteopathName?: string): Promise<Uint8Array> {
    const isDemo = await this.detectDemoMode();
    return await addProfessionalWatermark(pdfBytes, osteopathName, isDemo);
  }
  
  /**
   * Sécurise un Excel selon le mode détecté
   * @param workbook Le workbook original
   * @param osteopathName Nom de l'ostéopathe (optionnel)
   * @returns Le workbook sécurisé avec filigrane approprié et son hash
   */
  async secureExcel(workbook: ExcelJS.Workbook, osteopathName?: string): Promise<{ workbook: ExcelJS.Workbook; fileHash: string }> {
    const isDemo = await this.detectDemoMode();
    return await addWatermarkExcel(workbook, osteopathName, isDemo);
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