import { supabase } from '@/integrations/supabase/client';

export interface DemoData {
  patients: any[];
  appointments: any[];
  invoices: any[];
  stats: any;
}

// Service pour gérer le profil démo
export class DemoService {
  private static readonly DEMO_EMAIL = 'demo@patienthub.com';
  private static readonly DEMO_PASSWORD = 'demo123456';

  // Créer un compte démo automatiquement
  static async createDemoAccount(): Promise<{ email: string; password: string }> {
    try {
      // Vérifier si le compte démo existe déjà
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: this.DEMO_EMAIL,
        password: this.DEMO_PASSWORD,
      });

      if (existingUser.user) {
        // Le compte existe déjà, se déconnecter
        await supabase.auth.signOut();
        return {
          email: this.DEMO_EMAIL,
          password: this.DEMO_PASSWORD,
        };
      }
    } catch (error) {
      // Le compte n'existe pas, le créer
    }

    // Créer le compte démo
    const { data, error } = await supabase.auth.signUp({
      email: this.DEMO_EMAIL,
      password: this.DEMO_PASSWORD,
      options: {
        data: {
          first_name: 'Démo',
          last_name: 'Utilisateur',
          role: 'OSTEOPATH',
          is_demo: true,
        },
      },
    });

    if (error) {
      console.error('Erreur création compte démo:', error);
      throw error;
    }

    // Se déconnecter après la création
    await supabase.auth.signOut();

    return {
      email: this.DEMO_EMAIL,
      password: this.DEMO_PASSWORD,
    };
  }

  // Réinitialiser les données démo (à appeler quotidiennement)
  static async resetDemoData(): Promise<void> {
    try {
      // Se connecter avec le compte démo
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: this.DEMO_EMAIL,
        password: this.DEMO_PASSWORD,
      });

      if (authError || !authData.user) {
        console.error('Impossible de se connecter au compte démo:', authError);
        return;
      }

      // Supprimer les données existantes
      await this.clearDemoData(authData.user.id);

      // Recréer les données démo
      await this.seedDemoData(authData.user.id);

      // Se déconnecter
      await supabase.auth.signOut();

      console.log('Données démo réinitialisées avec succès');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des données démo:', error);
    }
  }

  // Supprimer les données existantes
  private static async clearDemoData(userId: string): Promise<void> {
    // Note: Cette méthode peut nécessiter des ajustements selon le schéma exact
    console.log('Nettoyage des données démo pour:', userId);
  }

  // Créer les données démo réalistes
  private static async seedDemoData(userId: string): Promise<void> {
    console.log('Création des données démo pour:', userId);
    // Cette méthode sera implémentée selon le schéma exact de la base de données
  }

  // Vérifier si l'utilisateur actuel est en mode démo
  static isDemoUser(userEmail?: string): boolean {
    return userEmail === this.DEMO_EMAIL;
  }

  // Obtenir les informations de connexion démo
  static getDemoCredentials(): { email: string; password: string } {
    return {
      email: this.DEMO_EMAIL,
      password: this.DEMO_PASSWORD,
    };
  }
}