/**
 * 🔐 Validation et Tests de l'Isolation du Mode Démo
 * 
 * Ce module valide que le mode démo reste strictement isolé de Supabase et des données réelles
 */

import { isDemoSession } from '@/utils/demo-detection';

export class DemoSecurityValidator {
  
  /**
   * Teste l'isolation complète du mode démo
   */
  static async validateDemoIsolation(): Promise<{
    isDemo: boolean;
    violations: string[];
    cabinetIsolated: boolean;
    storageIsolated: boolean;
  }> {
    const isDemo = await isDemoSession();
    const violations: string[] = [];
    
    if (!isDemo) {
      return {
        isDemo: false,
        violations: [],
        cabinetIsolated: true,
        storageIsolated: true
      };
    }
    
    console.log('🔍 Validation de l\'isolation du mode démo...');
    
    // Test 1: Vérifier que les services Cabinet détectent le mode démo
    let cabinetIsolated = true;
    try {
      const { supabaseCabinetService } = await import('./supabase-api/cabinet');
      await supabaseCabinetService.getCabinets();
      violations.push('VIOLATION: Service Supabase Cabinet accessible en mode démo');
      cabinetIsolated = false;
    } catch (error) {
      if (error instanceof Error && error.message.includes('VIOLATION SÉCURITÉ')) {
        console.log('✅ Service Cabinet correctement bloqué en mode démo');
      } else {
        violations.push(`Erreur inattendue Cabinet: ${error}`);
        cabinetIsolated = false;
      }
    }
    
    // Test 2: Vérifier que le DemoLocalStorage fonctionne
    let storageIsolated = true;
    try {
      const { demoLocalStorage } = await import('./demo-local-storage');
      
      if (!demoLocalStorage.isSessionActive()) {
        violations.push('VIOLATION: Session démo non active');
        storageIsolated = false;
      }
      
      // Tester l'accès aux données démo
      const cabinets = demoLocalStorage.getCabinets();
      if (cabinets.length !== 1 || cabinets[0].id !== 1) {
        violations.push('VIOLATION: Cabinet démo non configuré correctement');
        storageIsolated = false;
      }
      
      // Tester le blocage des modifications cabinet
      try {
        demoLocalStorage.updateCabinet(1, { name: 'Test' });
        violations.push('VIOLATION: Modification cabinet autorisée en mode démo');
        storageIsolated = false;
      } catch (error) {
        if (error instanceof Error && error.message.includes('MODE DÉMO')) {
          console.log('✅ Modification cabinet correctement bloquée en mode démo');
        }
      }
      
    } catch (error) {
      violations.push(`Erreur DemoLocalStorage: ${error}`);
      storageIsolated = false;
    }
    
    return {
      isDemo,
      violations,
      cabinetIsolated,
      storageIsolated
    };
  }
  
  /**
   * Affiche un rapport de sécurité du mode démo
   */
  static async generateSecurityReport(): Promise<void> {
    const result = await this.validateDemoIsolation();
    
    console.log('📋 RAPPORT DE SÉCURITÉ MODE DÉMO');
    console.log('================================');
    console.log(`Mode démo actif: ${result.isDemo ? '✅ OUI' : '❌ NON'}`);
    
    if (result.isDemo) {
      console.log(`Cabinet isolé: ${result.cabinetIsolated ? '✅ OUI' : '❌ NON'}`);
      console.log(`Stockage isolé: ${result.storageIsolated ? '✅ OUI' : '❌ NON'}`);
      
      if (result.violations.length > 0) {
        console.error('🚨 VIOLATIONS DÉTECTÉES:');
        result.violations.forEach(violation => {
          console.error(`  - ${violation}`);
        });
      } else {
        console.log('✅ Aucune violation détectée - Mode démo sécurisé');
      }
    }
    
    console.log('================================');
  }
}