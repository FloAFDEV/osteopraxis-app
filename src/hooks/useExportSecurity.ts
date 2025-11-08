import { useCallback } from 'react';
import { exportSecurity } from '@/utils/export-utils';
import ExcelJS from 'exceljs';

/**
 * Hook pour la gestion sécurisée des exports avec détection automatique du mode démo
 */
export function useExportSecurity() {
  /**
   * Sécurise un PDF (ajoute un filigrane professionnel ou démo selon le mode)
   */
  const securePDF = useCallback(async (pdfBytes: Uint8Array, osteopathName?: string): Promise<Uint8Array> => {
    return await exportSecurity.securePDF(pdfBytes, osteopathName);
  }, []);

  /**
   * Sécurise un Excel (ajoute un filigrane professionnel ou démo selon le mode)
   * @returns { workbook, fileHash } Le workbook sécurisé et son hash SHA-256
   */
  const secureExcel = useCallback(async (workbook: ExcelJS.Workbook, osteopathName?: string): Promise<{ workbook: ExcelJS.Workbook; fileHash: string }> => {
    return await exportSecurity.secureExcel(workbook, osteopathName);
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