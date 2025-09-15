import { supabase } from '@/integrations/supabase/client';

export interface DemoData {
  patients: any[];
  appointments: any[];
  invoices: any[];
  stats: any;
}

// Service pour gérer les profils démo temporaires
export class DemoService {
  private static readonly DEMO_PASSWORD = 'demo123456';
  private static readonly DEMO_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  // Générer un email démo unique pour la session
  private static generateDemoEmail(): string {
    const sessionId = crypto.randomUUID().substring(0, 8);
    return `demo-${sessionId}@patienthub.com`;
  }

  // Créer une session démo locale éphémère
  static async createDemoAccount(): Promise<{ email: string; password: string; sessionId: string }> {
    try {
      console.log('🎭 Création d\'une session démo éphémère locale...');
      
      const { demoLocalStorage } = await import('./demo-local-storage');
      
      // Créer une nouvelle session locale éphémère
      const session = demoLocalStorage.createSession();
      console.log(`🎭 Session démo locale créée: ${session.sessionId}`);
      
      // Seed avec des données démo de base
      demoLocalStorage.seedDemoData();
      
      // Générer des identifiants factices (pour compatibilité avec l'interface)
      const demoEmail = `demo-${session.sessionId}@patienthub.com`;
      const demoPassword = `demo${session.sessionId}`;
      
      console.log(`✅ Session démo éphémère prête: ${session.sessionId}`);
      
      return {
        email: demoEmail,
        password: demoPassword,
        sessionId: session.sessionId
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la création de la session démo:', error);
      throw new Error(`Impossible de créer la session démo: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // Réinitialiser les données démo (redirige vers le nettoyage automatique)
  static async resetDemoData(): Promise<void> {
    await this.cleanupExpiredDemoAccounts();
  }

  // Nettoyer automatiquement les comptes démo expirés
  static async cleanupExpiredDemoAccounts(): Promise<void> {
    try {
      console.log('🧹 Nettoyage des comptes démo expirés...');
      
      // Appeler la fonction de nettoyage edge
      const { data, error } = await supabase.functions.invoke('demo-cleanup');
      
      if (error) {
        console.error('Erreur lors du nettoyage:', error);
      } else {
        console.log(`✅ Nettoyage terminé: ${data?.deletedCount || 0} comptes supprimés`);
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage automatique:', error);
    }
  }

  // Vérifier si la session démo actuelle est expirée
  static isSessionExpired(): boolean {
    try {
      const { demoLocalStorage } = require('./demo-local-storage');
      return !demoLocalStorage.isSessionActive();
    } catch {
      return true;
    }
  }

  // Obtenir les infos de la session démo actuelle
  static getCurrentDemoSession(): { email: string; sessionId: string; expiresAt: string; remainingTime: number } | null {
    try {
      const { demoLocalStorage } = require('./demo-local-storage');
      const session = demoLocalStorage.getCurrentSession();
      
      if (!session) return null;
      
      const remainingTime = new Date(session.expiresAt).getTime() - Date.now();
      
      if (remainingTime <= 0) {
        demoLocalStorage.clearSession();
        return null;
      }
      
      return {
        email: `demo-${session.sessionId}@patienthub.com`,
        sessionId: session.sessionId,
        expiresAt: session.expiresAt.toISOString(),
        remainingTime
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la session démo:', error);
      return null;
    }
  }

  // Créer des données démo temporaires avec expiration
  private static async seedTemporaryDemoData(userId: string, sessionId: string, expiresAt: Date): Promise<void> {
    try {
      console.log(`🌱 Création données temporaires pour session ${sessionId}`);
      
      // Créer le profil ostéopathe temporaire
      const { data: osteopath, error: osteopathError } = await supabase
        .from('Osteopath')
        .insert({
          authId: userId,
          userId: userId,
          name: `Dr. Demo Session-${sessionId}`,
          professional_title: 'Ostéopathe D.O.',
          rpps_number: `demo${sessionId}`,
          siret: `demo${sessionId}${Math.floor(Math.random() * 1000)}`,
          ape_code: '8690F',
          is_demo_data: true,
          demo_expires_at: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (osteopathError) {
        console.error('Erreur création ostéopathe temporaire:', osteopathError);
        return;
      }

      // Créer l'utilisateur
      await supabase
        .from('User')
        .insert({
          id: userId,
          auth_id: userId,
          first_name: 'Dr. Demo',
          last_name: `Session-${sessionId}`,
          email: `demo-${sessionId}@patienthub.com`,
          role: 'OSTEOPATH',
          osteopathId: osteopath.id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      // Créer le cabinet temporaire
      const { data: cabinet } = await supabase
        .from('Cabinet')
        .insert({
          name: `Cabinet Démo ${sessionId}`,
          address: `123 Rue de la Démo, 75000 Paris`,
          phone: '01 23 45 67 89',
          email: `cabinet-${sessionId}@demo.fr`,
          osteopathId: osteopath.id,
          is_demo_data: true,
          demo_expires_at: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (cabinet) {
        // Créer des patients temporaires uniques
        const patients = await this.createTemporaryPatients(osteopath.id, cabinet.id, expiresAt, sessionId);
        
        // Créer quelques rendez-vous temporaires
        await this.createTemporaryAppointments(patients, osteopath.id, cabinet.id, expiresAt);
        
        // Créer quelques factures temporaires
        await this.createTemporaryInvoices(patients, osteopath.id, cabinet.id, expiresAt);
      }

      console.log(`✅ Données temporaires créées pour session ${sessionId}, expire le ${expiresAt.toLocaleString()}`);
    } catch (error) {
      console.error('Erreur lors de la création des données temporaires:', error);
    }
  }

  private static async createTemporaryPatients(osteopathId: number, cabinetId: number, expiresAt: Date, sessionId: string) {
    const patientNames = [
      { firstName: 'Jean', lastName: 'Dupont', phone: '06 12 34 56 78', birthDate: '1985-03-15' },
      { firstName: 'Marie', lastName: 'Martin', phone: '06 98 76 54 32', birthDate: '1990-07-22' },
      { firstName: 'Pierre', lastName: 'Bernard', phone: '06 45 67 89 12', birthDate: '1978-11-08' }
    ];

    const patients = [];
    for (let i = 0; i < patientNames.length; i++) {
      const patient = patientNames[i];
      const { data, error } = await supabase
        .from('Patient')
        .insert({
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: `${patient.firstName.toLowerCase()}.${patient.lastName.toLowerCase()}-${sessionId}@demo.com`,
          phone: patient.phone,
          birthDate: patient.birthDate,
          osteopathId,
          cabinetId,
          is_demo_data: true,
          demo_expires_at: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (!error && data) {
        patients.push(data);
      }
    }
    return patients;
  }

  private static async createTemporaryAppointments(patients: any[], osteopathId: number, cabinetId: number, expiresAt: Date) {
    const now = new Date();
    const appointments = [
      {
        patientId: patients[0]?.id,
        date: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), // Dans 2h
        reason: 'Consultation lombalgie',
        status: 'SCHEDULED' as const
      },
      {
        patientId: patients[1]?.id,
        date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Demain
        reason: 'Suivi cervicalgie',
        status: 'SCHEDULED' as const
      }
    ];

    for (const apt of appointments) {
      if (apt.patientId) {
        await supabase
          .from('Appointment')
          .insert({
            ...apt,
            osteopathId: osteopathId,
            cabinetId: cabinetId,
            notes: 'Rendez-vous de démonstration',
            notificationSent: false,
            is_demo_data: true,
            demo_expires_at: expiresAt.toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
      }
    }
  }

  private static async createTemporaryInvoices(patients: any[], osteopathId: number, cabinetId: number, expiresAt: Date) {
    if (patients.length > 0) {
      await supabase
        .from('Invoice')
        .insert({
          patientId: patients[0].id,
          osteopathId,
          cabinetId,
          amount: 60,
          date: new Date().toISOString(),
          paymentStatus: 'PAID' as const,
          paymentMethod: 'Carte bancaire',
          notes: 'Facture de démonstration',
          is_demo_data: true,
          demo_expires_at: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
    }
  }

  // Maintenir l'ancienne méthode pour compatibilité (peut être supprimée)
  private static async seedDemoData(userId: string): Promise<void> {
    try {
      console.log('Création des données démo pour:', userId);
      
      // Vérifier si l'ostéopathe existe déjà
      const { data: existingOsteopath } = await supabase
        .from('Osteopath')
        .select('id')
        .eq('authId', userId)
        .single();

        if (!existingOsteopath) {
        // Créer le profil ostéopathe démo d'abord
        const { data: osteopath, error: osteopathError } = await supabase
          .from('Osteopath')
          .upsert({
            authId: userId,
            userId: userId,
            name: 'Dr. Marie Dubois',
            professional_title: 'Ostéopathe D.O.',
            rpps_number: '10003123456',
            siret: '12345678901234',
            ape_code: '8690F',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, {
            onConflict: 'authId'
          })
          .select()
          .single();

        if (osteopathError) {
          console.error('Erreur création ostéopathe:', osteopathError);
          return;
        }

        console.log('Profil ostéopathe démo créé avec succès:', osteopath.id);

        // Créer/mettre à jour l'utilisateur avec l'osteopathId
        const { data: user, error: userError } = await supabase
          .from('User')
          .upsert({
            id: userId,
            auth_id: userId,
            first_name: 'Dr. Marie',
            last_name: 'Dubois',
            email: `demo-old@patienthub.com`, // Old demo email for compatibility
            role: 'OSTEOPATH',
            osteopathId: osteopath.id,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'email'
          })
          .select()
          .single();

        if (userError) {
          console.error('Erreur création utilisateur:', userError);
          return;
        }

        console.log('Utilisateur démo créé/mis à jour avec succès:', user.id);

        // Créer un cabinet démo pour l'ostéopathe
        const { data: cabinet, error: cabinetError } = await supabase
          .from('Cabinet')
          .upsert({
            name: 'Cabinet Ostéopathique Démo',
            address: '123 Rue de la Santé, 75000 Paris',
            phone: '01 23 45 67 89',
            email: 'contact@cabinet-demo.fr',
            osteopathId: osteopath.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, {
            onConflict: 'osteopathId'
          })
          .select()
          .single();

        if (cabinetError) {
          console.error('Erreur création cabinet démo:', cabinetError);
        } else {
          console.log('Cabinet démo créé avec succès:', cabinet.id);
          
          // Créer quelques patients de démonstration
          const demoPatients = [
            {
              firstName: 'Marie',
              lastName: 'Martin',
              email: 'marie.martin@demo.com',
              phone: '06 12 34 56 78',
              birthDate: '1985-03-15',
              osteopathId: osteopath.id,
              cabinetId: cabinet.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              firstName: 'Pierre',
              lastName: 'Dubois', 
              email: 'pierre.dubois@demo.com',
              phone: '06 98 76 54 32',
              birthDate: '1990-07-22',
              osteopathId: osteopath.id,
              cabinetId: cabinet.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];

          for (const patient of demoPatients) {
            const { error: patientError } = await supabase
              .from('Patient')
              .upsert(patient, {
                onConflict: 'email'
              });

            if (patientError) {
              console.error('Erreur création patient démo:', patientError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création des données:', error);
    }
  }

  // Vérifier si l'utilisateur actuel est en mode démo
  static isDemoUser(userEmail?: string): boolean {
    if (!userEmail) return false;
    return userEmail.startsWith('demo-') && userEmail.includes('@patienthub.com');
  }

  // Obtenir les informations de connexion démo de la session actuelle
  static getDemoCredentials(): { email: string; password: string } | null {
    const session = this.getCurrentDemoSession();
    if (!session) return null;
    
    return {
      email: session.email,
      password: this.DEMO_PASSWORD,
    };
  }
}

// Hook pour la gestion de l'authentification démo temporaire
export function useDemoAuth() {
  const loginDemo = async () => {
    // Créer une session démo locale (pas d'authentification Supabase)
    const credentials = await DemoService.createDemoAccount();
    console.log('🎭 Session démo locale prête, connexion factice...');
    
    // Retourner des données factices pour simuler une connexion
    return {
      user: {
        id: `demo-${credentials.sessionId}`,
        email: credentials.email,
        user_metadata: {
          is_demo_user: true,
          session_id: credentials.sessionId
        }
      },
      session: {
        access_token: `demo-token-${credentials.sessionId}`,
        refresh_token: `demo-refresh-${credentials.sessionId}`,
        user: {
          id: `demo-${credentials.sessionId}`,
          email: credentials.email
        }
      }
    };
  };

  return {
    loginDemo,
    isLoading: false,
    getCurrentSession: DemoService.getCurrentDemoSession,
    isSessionExpired: DemoService.isSessionExpired,
  };
}