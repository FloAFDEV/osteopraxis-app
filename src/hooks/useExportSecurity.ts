import { useCallback } from 'react';
import { exportSecurity } from '@/utils/export-utils';
import ExcelJS from 'exceljs';

/**
 * Hook pour la gestion sécurisée des exports avec détection automatique du mode démo
 */
export function useExportSecurity() {
  /**
   * Sécurise un PDF (ajoute un filigrane en mode démo)
   */
  const securePDF = useCallback(async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
    return await exportSecurity.securePDF(pdfBytes);
  }, []);

  /**
   * Sécurise un Excel (ajoute des avertissements en mode démo)
   */
  const secureExcel = useCallback(async (workbook: ExcelJS.Workbook): Promise<ExcelJS.Workbook> => {
    return await exportSecurity.secureExcel(workbook);
  }, []);

  /**
   * Génère un numéro de devis sécurisé (préfixé DEMO en mode démo)
   */
  const generateSecureQuoteNumber = useCallback(async (): Promise<string> => {
    return await exportSecurity.generateSecureQuoteNumber();
  }, []);

  /**
   * Détecte si on est en mode démo
   */
  const detectDemoMode = useCallback(async (): Promise<boolean> => {
    return await exportSecurity.detectDemoMode();
  }, []);

  /**
   * Force la réinitialisation de la détection du mode démo
   * Utile après un changement de session
   */
  const resetDemoDetection = useCallback((): void => {
    exportSecurity.resetDemoDetection();
  }, []);

  return {
    securePDF,
    secureExcel,
    generateSecureQuoteNumber,
    detectDemoMode,
    resetDemoDetection,
  };
}