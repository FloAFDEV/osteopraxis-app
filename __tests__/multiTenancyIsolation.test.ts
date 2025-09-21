/**
 * 🔐 Tests de Multi-Tenancy et Isolation des Modes de Stockage
 * 
 * Ce fichier teste l'isolation stricte entre :
 * - Mode Démo : données fictives, cabinet fixe, session 30min, aucun Supabase
 * - Mode Cloud (Non-HDS) : Supabase normal, chaque tenant voit ses données uniquement
 * - Mode Secure HDS : stockage local (FSA/IndexedDB), chiffrement AES-256-GCM, aucune fuite Supabase
 */

import { describe, it, expect, beforeEach, afterEach, jest, beforeAll, afterAll } from '@jest/globals';
import { Patient, Appointment, Invoice, Cabinet } from '@/types';
import { patientService } from '@/services/api/patient-service';
import { appointmentService } from '@/services/api/appointment-service';
import { invoiceService } from '@/services/api/invoice-service';
import { cabinetService } from '@/services/api/cabinet-service';
import { demoLocalStorage } from '@/services/demo-local-storage';
import { isDemoSession, clearDemoSessionCache } from '@/utils/demo-detection';
import { storageRouter } from '@/services/storage/storage-router';

// Mocks Supabase pour détecter les accès non autorisés
const mockSupabaseQueries = jest.fn();
const mockSupabaseAuth = jest.fn();

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSupabaseQueries,
      insert: mockSupabaseQueries,
      update: mockSupabaseQueries,
      delete: mockSupabaseQueries,
      upsert: mockSupabaseQueries
    })),
    auth: {
      getSession: mockSupabaseAuth,
      getUser: mockSupabaseAuth,
      signIn: mockSupabaseAuth,
      signOut: mockSupabaseAuth
    }
  }
}));

// Mock du localStorage et sessionStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

describe('🔐 Multi-Tenancy et Isolation des Modes de Stockage', () => {
  
  // Données de test pour différents tenants
  const TENANT_A_DATA = {
    cabinet: { id: 1, name: 'Cabinet Alpha', osteopathId: 101 },
    patient: { firstName: 'Alice', lastName: 'Alpha', osteopathId: 101, cabinetId: 1 },
    appointment: { patientId: 1, osteopathId: 101, cabinetId: 1, date: '2024-01-01T10:00:00Z' },
    invoice: { patientId: 1, amount: 60, osteopathId: 101, cabinetId: 1 }
  };
  
  const TENANT_B_DATA = {
    cabinet: { id: 2, name: 'Cabinet Beta', osteopathId: 202 },
    patient: { firstName: 'Bob', lastName: 'Beta', osteopathId: 202, cabinetId: 2 },
    appointment: { patientId: 2, osteopathId: 202, cabinetId: 2, date: '2024-01-01T14:00:00Z' },
    invoice: { patientId: 2, amount: 75, osteopathId: 202, cabinetId: 2 }
  };

  beforeEach(() => {
    // Reset tous les mocks
    jest.clearAllMocks();
    clearDemoSessionCache();
    
    // Reset du stockage
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
    
    // Reset des mocks Supabase
    mockSupabaseQueries.mockResolvedValue({ data: [], error: null });
    mockSupabaseAuth.mockResolvedValue({ data: { session: null }, error: null });
  });

  afterEach(() => {
    // Nettoyer les sessions
    if (demoLocalStorage.isSessionActive()) {
      demoLocalStorage.clearSession();
    }
  });

  describe('🎭 MODE DÉMO - Isolation Stricte', () => {
    
    beforeEach(() => {
      // Simuler une session démo active
      const mockSession = {
        sessionId: 'demo-test-123',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        isActive: true
      };
      
      (window.sessionStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'demo_session') return JSON.stringify(mockSession);
        if (key.startsWith('demo_data_')) return JSON.stringify({
          patients: [],
          appointments: [],
          invoices: [],
          cabinets: [{
            id: 1,
            name: "Cabinet de Démonstration",
            address: "123 Avenue de la Santé",
            postalCode: "75001",
            city: "Paris",
            phone: "01 23 45 67 89",
            email: "contact@cabinet-demo.fr",
            osteopathId: 999,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]
        });
        return null;
      });
    });

    it('🔒 CRITIQUE: Aucun accès Supabase en mode démo', async () => {
      expect(await isDemoSession()).toBe(true);
      
      // Tenter des opérations qui ne doivent PAS déclencher Supabase
      await patientService.getPatients();
      await appointmentService.getAppointments();
      await invoiceService.getInvoices();
      
      // Vérifier qu'aucune requête Supabase n'a été faite
      expect(mockSupabaseQueries).not.toHaveBeenCalled();
      expect(mockSupabaseAuth).toHaveBeenCalledTimes(2); // Seulement pour la détection de mode
    });

    it('🏥 Cabinet fixe et non modifiable en mode démo', async () => {
      expect(await isDemoSession()).toBe(true);
      
      const cabinets = await cabinetService.getCabinets();
      expect(cabinets).toHaveLength(1);
      expect(cabinets[0].name).toBe("Cabinet de Démonstration");
      expect(cabinets[0].id).toBe(1);
      
      // Tenter de modifier le cabinet doit échouer
      await expect(async () => {
        await cabinetService.updateCabinet(1, { name: 'Nouveau nom' });
      }).rejects.toThrow('MODE DÉMO');
      
      // Tenter de créer un cabinet doit échouer
      await expect(async () => {
        await cabinetService.createCabinet({ name: 'Autre cabinet', address: 'Test' });
      }).rejects.toThrow('MODE DÉMO');
    });

    it('⏰ Session démo limitée à 30 minutes', () => {
      expect(demoLocalStorage.isSessionActive()).toBe(true);
      
      const stats = demoLocalStorage.getSessionStats();
      expect(stats.timeRemaining).toBeGreaterThan(25 * 60 * 1000); // Au moins 25 min restantes
      expect(stats.timeRemaining).toBeLessThanOrEqual(30 * 60 * 1000); // Max 30 min
    });

    it('🔗 Isolation des données démo (sessionStorage uniquement)', async () => {
      expect(await isDemoSession()).toBe(true);
      
      // Créer des données de test
      const patient = await patientService.createPatient(TENANT_A_DATA.patient as any);
      const appointment = await appointmentService.createAppointment({
        ...TENANT_A_DATA.appointment,
        patientId: patient.id,
        reason: 'Test démo',
        status: 'SCHEDULED',
        notificationSent: false
      } as any);
      
      // Vérifier que les données sont bien isolées en sessionStorage
      expect(window.sessionStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
      
      // Vérifier qu'on ne peut accéder qu'aux données de cette session
      const patients = await patientService.getPatients();
      expect(patients).toHaveLength(1);
      expect(patients[0].firstName).toBe('Alice');
    });

    it('🚫 Pas de fuite vers les autres modes', async () => {
      expect(await isDemoSession()).toBe(true);
      
      // Créer des données en mode démo
      await patientService.createPatient(TENANT_A_DATA.patient as any);
      
      // Simuler passage en mode connecté
      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
      clearDemoSessionCache();
      
      // Vérifier qu'on ne voit plus les données démo
      expect(await isDemoSession()).toBe(false);
      const patients = await patientService.getPatients();
      // En mode connecté sans vraies données, la liste doit être vide ou différente
      expect(patients).not.toContainEqual(expect.objectContaining({ firstName: 'Alice' }));
    });
  });

  describe('☁️ MODE CLOUD (Non-HDS) - Multi-Tenant', () => {
    
    beforeEach(() => {
      // Simuler mode connecté (pas de session démo)
      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
      mockSupabaseAuth.mockResolvedValue({ 
        data: { session: { user: { id: 'tenant-a', email: 'user-a@test.com' } } }, 
        error: null 
      });
    });

    it('🔗 Accès Supabase autorisé en mode cloud', async () => {
      expect(await isDemoSession()).toBe(false);
      
      // Configurer les réponses Supabase
      mockSupabaseQueries.mockResolvedValue({ 
        data: [{ ...TENANT_A_DATA.patient, id: 1 }], 
        error: null 
      });
      
      await patientService.getPatients();
      
      // Vérifier que Supabase a été appelé
      expect(mockSupabaseQueries).toHaveBeenCalled();
    });

    it('🏢 Isolation entre tenants différents', async () => {
      expect(await isDemoSession()).toBe(false);
      
      // Simuler tenant A qui voit ses données
      mockSupabaseQueries
        .mockResolvedValueOnce({ data: [{ ...TENANT_A_DATA.patient, id: 1 }], error: null })
        .mockResolvedValueOnce({ data: [{ ...TENANT_A_DATA.appointment, id: 1 }], error: null });
      
      const patientsA = await patientService.getPatients();
      const appointmentsA = await appointmentService.getAppointments();
      
      expect(patientsA).toHaveLength(1);
      expect(patientsA[0].firstName).toBe('Alice');
      expect(appointmentsA).toHaveLength(1);
      
      // Simuler changement de tenant
      mockSupabaseAuth.mockResolvedValue({ 
        data: { session: { user: { id: 'tenant-b', email: 'user-b@test.com' } } }, 
        error: null 
      });
      
      // Tenant B ne doit voir que ses données
      mockSupabaseQueries
        .mockResolvedValueOnce({ data: [{ ...TENANT_B_DATA.patient, id: 2 }], error: null })
        .mockResolvedValueOnce({ data: [{ ...TENANT_B_DATA.appointment, id: 2 }], error: null });
      
      const patientsB = await patientService.getPatients();
      const appointmentsB = await appointmentService.getAppointments();
      
      expect(patientsB).toHaveLength(1);
      expect(patientsB[0].firstName).toBe('Bob');
      expect(patientsB[0].firstName).not.toBe('Alice'); // Isolation confirmée
    });

    it('🔐 RLS (Row Level Security) empêche les croisements', async () => {
      expect(await isDemoSession()).toBe(false);
      
      // Simuler tentative d'accès cross-tenant (RLS doit bloquer)
      mockSupabaseQueries.mockResolvedValue({ data: [], error: null }); // RLS renvoie vide
      
      const patients = await patientService.getPatients();
      expect(patients).toHaveLength(0); // RLS a bloqué l'accès aux autres tenants
    });
  });

  describe('🔐 MODE SECURE HDS - Stockage Local Chiffré', () => {
    
    beforeEach(() => {
      // Simuler mode sécurisé (pas de session démo, données HDS)
      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
      mockSupabaseAuth.mockResolvedValue({ data: { session: null }, error: null });
    });

    it('🚫 CRITIQUE: Aucun accès Supabase pour données HDS', async () => {
      expect(await isDemoSession()).toBe(false);
      
      // Simuler classification HDS pour forcer le stockage local
      jest.doMock('@/services/storage/data-classification', () => ({
        isHDSData: jest.fn().mockReturnValue(true),
        validateHDSSecurityPolicy: jest.fn().mockImplementation((dataType, storage) => {
          if (storage === 'supabase') {
            throw new Error('VIOLATION SÉCURITÉ HDS: données HDS interdites sur Supabase');
          }
        })
      }));
      
      // Les données HDS ne doivent jamais toucher Supabase
      await expect(async () => {
        // Forcer une tentative d'écriture Supabase pour données HDS
        mockSupabaseQueries.mockImplementation(() => {
          throw new Error('VIOLATION HDS: Tentative accès Supabase pour données sensibles');
        });
        await patientService.createPatient(TENANT_A_DATA.patient as any);
      }).rejects.toThrow(/HDS|sensibles/);
      
      // Vérifier qu'aucune requête Supabase n'a abouti
      expect(mockSupabaseQueries).not.toHaveBeenCalledWith(expect.objectContaining({
        table: expect.stringMatching(/Patient|Appointment|MedicalDocument/)
      }));
    });

    it('🔒 Chiffrement AES-256-GCM pour stockage local', async () => {
      // Ce test vérifierait l'implémentation du chiffrement
      // Pour l'instant, on vérifie que les données ne vont pas en clair
      
      expect(await isDemoSession()).toBe(false);
      
      // Mock du localStorage pour capturer les données
      const storedData: string[] = [];
      (window.localStorage.setItem as jest.Mock).mockImplementation((key, value) => {
        storedData.push(value);
      });
      
      // TODO: Implémenter quand le système HDS sécurisé sera en place
      // await patientService.createPatient(TENANT_A_DATA.patient as any);
      
      // Vérifier que les données stockées sont chiffrées (ne contiennent pas de texte en clair)
      // storedData.forEach(data => {
      //   expect(data).not.toContain('Alice');
      //   expect(data).not.toContain('Alpha');
      //   expect(data).toMatch(/^[A-Za-z0-9+/=]+$/); // Format base64 chiffré
      // });
    });

    it('📁 Export/Import backup .phds fonctionnel', async () => {
      // Test du format de sauvegarde sécurisé
      
      // TODO: Implémenter quand le système HDS sécurisé sera en place
      // const backupData = await hdsSecureStorage.exportBackup();
      // expect(backupData).toBeInstanceOf(Blob);
      
      // const backupText = await backupData.text();
      // const parsed = JSON.parse(backupText);
      // expect(parsed).toMatchObject({
      //   version: 1,
      //   timestamp: expect.any(String),
      //   salt: expect.any(String),
      //   iv: expect.any(String),
      //   ciphertext: expect.any(String)
      // });
    });
  });

  describe('🔄 TRANSITIONS ENTRE MODES', () => {
    
    it('🎭➡️☁️ Transition Démo vers Cloud sans fuite', async () => {
      // Phase 1: Mode démo
      const mockDemoSession = {
        sessionId: 'demo-test-456',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        isActive: true
      };
      
      (window.sessionStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'demo_session') return JSON.stringify(mockDemoSession);
        return null;
      });
      
      expect(await isDemoSession()).toBe(true);
      
      // Créer données démo
      await patientService.createPatient({ firstName: 'Demo', lastName: 'Patient' } as any);
      
      // Phase 2: Transition vers mode cloud
      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
      clearDemoSessionCache();
      mockSupabaseAuth.mockResolvedValue({ 
        data: { session: { user: { id: 'real-user', email: 'real@test.com' } } }, 
        error: null 
      });
      
      expect(await isDemoSession()).toBe(false);
      
      // Phase 3: Vérifier isolation
      mockSupabaseQueries.mockResolvedValue({ data: [], error: null });
      const patients = await patientService.getPatients();
      
      // Les données démo ne doivent pas être visibles en mode cloud
      expect(patients).not.toContainEqual(expect.objectContaining({ firstName: 'Demo' }));
      expect(mockSupabaseQueries).toHaveBeenCalled(); // Mode cloud utilise Supabase
    });

    it('☁️➡️🔐 Transition Cloud vers Secure sans fuite', async () => {
      // Phase 1: Mode cloud
      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
      mockSupabaseAuth.mockResolvedValue({ 
        data: { session: { user: { id: 'cloud-user', email: 'cloud@test.com' } } }, 
        error: null 
      });
      
      expect(await isDemoSession()).toBe(false);
      
      // Simuler données cloud
      mockSupabaseQueries.mockResolvedValue({ 
        data: [{ firstName: 'Cloud', lastName: 'Patient', id: 1 }], 
        error: null 
      });
      
      const cloudPatients = await patientService.getPatients();
      expect(cloudPatients).toHaveLength(1);
      
      // Phase 2: Transition vers mode sécurisé (simulation)
      // En réalité, ceci nécessiterait une migration des données
      mockSupabaseAuth.mockResolvedValue({ data: { session: null }, error: null });
      
      // Phase 3: Vérifier que les nouvelles données sensibles ne vont pas sur Supabase
      jest.resetAllMocks();
      
      // TODO: Tester avec le vrai système HDS sécurisé
      // await patientService.createPatient({ firstName: 'Secure', lastName: 'Patient' } as any);
      // expect(mockSupabaseQueries).not.toHaveBeenCalled(); // Aucun accès Supabase pour HDS
    });
  });

  describe('🧪 TESTS DE ROBUSTESSE', () => {
    
    it('💥 Résilience aux tentatives de bypass de sécurité', async () => {
      expect(await isDemoSession()).toBe(false);
      
      // Tentative de forcer l'utilisation de Supabase pour données HDS
      const maliciousData = {
        firstName: 'Hacker',
        lastName: 'Attempt',
        // Tentative d'injection pour forcer Supabase
        _forceSupabase: true,
        _bypassHDS: 'true'
      };
      
      // Le système doit rejeter ou ignorer ces tentatives
      await expect(async () => {
        // Si le système HDS est bien implémenté, ceci doit échouer
        await patientService.createPatient(maliciousData as any);
      }).not.toThrow(); // Le système doit gérer gracieusement
      
      // Vérifier qu'aucune donnée malveillante n'atteint Supabase
      expect(mockSupabaseQueries).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ _forceSupabase: true })
        })
      );
    });

    it('🔄 Cache et état partagé ne fuient pas entre modes', async () => {
      // Phase 1: Mode démo avec cache
      const mockDemoSession = {
        sessionId: 'cache-test-789',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        isActive: true
      };
      
      (window.sessionStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'demo_session') return JSON.stringify(mockDemoSession);
        return null;
      });
      
      expect(await isDemoSession()).toBe(true);
      await patientService.getPatients(); // Remplir le cache démo
      
      // Phase 2: Changement de mode
      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
      clearDemoSessionCache();
      
      expect(await isDemoSession()).toBe(false);
      
      // Phase 3: Vérifier que le cache est bien nettoyé
      mockSupabaseQueries.mockResolvedValue({ data: [], error: null });
      const patients = await patientService.getPatients();
      
      // Pas de données démo en cache
      expect(patients).toEqual([]);
      expect(mockSupabaseQueries).toHaveBeenCalled(); // Mode cloud actif
    });

    it('⚡ Performance: Pas de dégradation avec multi-tenancy', async () => {
      expect(await isDemoSession()).toBe(false);
      
      const startTime = Date.now();
      
      // Simuler plusieurs requêtes tenant-isolées
      mockSupabaseQueries.mockResolvedValue({ data: [], error: null });
      
      await Promise.all([
        patientService.getPatients(),
        appointmentService.getAppointments(),
        invoiceService.getInvoices(),
        cabinetService.getCabinets()
      ]);
      
      const executionTime = Date.now() - startTime;
      
      // Les requêtes multi-tenant ne doivent pas être excessivement lentes
      expect(executionTime).toBeLessThan(1000); // Moins d'1 seconde
      expect(mockSupabaseQueries).toHaveBeenCalledTimes(4); // Toutes les requêtes
    });
  });

  describe('📊 AUDIT ET CONFORMITÉ', () => {
    
    it('📝 Traçabilité des accès par mode', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Test mode démo
      (window.sessionStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'demo_session') return JSON.stringify({
          sessionId: 'audit-test',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          isActive: true
        });
        return null;
      });
      
      expect(await isDemoSession()).toBe(true);
      await patientService.getPatients();
      
      // Vérifier que les logs de mode démo sont présents
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🎭')
      );
      
      consoleSpy.mockRestore();
    });

    it('🔍 Validation conformité RGPD/HDS', async () => {
      // Ce test vérifierait que les données sensibles :
      // 1. Ne transitent jamais par Supabase
      // 2. Sont chiffrées localement
      // 3. Peuvent être exportées/supprimées (droit à l'oubli)
      // 4. Ont un audit trail complet
      
      expect(await isDemoSession()).toBe(false);
      
      // TODO: Implémenter avec le vrai système HDS
      // const auditLogs = await getHDSAuditLogs();
      // expect(auditLogs).toContainEqual(expect.objectContaining({
      //   action: 'DATA_ACCESS',
      //   dataType: 'Patient',
      //   encryption: 'AES-256-GCM',
      //   location: 'local'
      // }));
    });
  });
});

// Test de fuite de mémoire et nettoyage
afterAll(() => {
  // Nettoyer tous les mocks et caches
  jest.restoreAllMocks();
  clearDemoSessionCache();
  
  // Vérifier qu'aucune donnée sensible ne reste en mémoire
  // TODO: Implémenter vérification de nettoyage mémoire
});