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

  // Créer ou obtenir le compte démo
  static async createDemoAccount(): Promise<{ email: string; password: string }> {
    try {
      // Vérifier si le compte existe déjà
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: this.DEMO_EMAIL,
        password: this.DEMO_PASSWORD,
      });

      if (signInData.user) {
        // Le compte existe, vérifier s'il a un profil ostéopathe
        const { data: osteopath } = await supabase
          .from('Osteopath')
          .select('id')
          .eq('authId', signInData.user.id)
          .single();

        if (!osteopath) {
          // Créer le profil ostéopathe manquant
          await this.seedDemoData(signInData.user.id);
        }

        await supabase.auth.signOut();
        return { email: this.DEMO_EMAIL, password: this.DEMO_PASSWORD };
      }

      // Créer le compte s'il n'existe pas
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: this.DEMO_EMAIL,
        password: this.DEMO_PASSWORD,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: 'Dr. Marie',
            last_name: 'Dubois',
            role: 'OSTEOPATH',
            is_demo: true,
          }
        }
      });

      if (signUpError) {
        console.error('Erreur création compte démo:', signUpError);
        throw signUpError;
      }

      if (signUpData.user) {
        // Créer le profil ostéopathe
        await this.seedDemoData(signUpData.user.id);
        await supabase.auth.signOut();
      }

      return { email: this.DEMO_EMAIL, password: this.DEMO_PASSWORD };
    } catch (error) {
      console.error('Erreur lors de la création du compte démo:', error);
      throw error;
    }
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
    try {
      console.log('Nettoyage des données démo pour:', userId);
      
      // Supprimer les données de test créées
      const { data: osteopath } = await supabase
        .from('Osteopath')
        .select('id')
        .eq('authId', userId)
        .single();

      if (osteopath) {
        // Supprimer les données dans l'ordre des dépendances
        await supabase.from('Invoice').delete().eq('osteopathId', osteopath.id);
        await supabase.from('Appointment').delete().eq('osteopathId', osteopath.id);
        await supabase.from('Patient').delete().eq('osteopathId', osteopath.id);
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }

  // Créer les données démo réalistes
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
        // Vérifier si l'utilisateur existe déjà dans la table User
        const { data: existingUser } = await supabase
          .from('User')
          .select('id')
          .eq('auth_id', userId)
          .single();

        let user = existingUser;
        
        if (!existingUser) {
          // Créer l'utilisateur seulement s'il n'existe pas
          const { data: newUser, error: userError } = await supabase
            .from('User')
            .insert({
              auth_id: userId,
              first_name: 'Dr. Marie',
              last_name: 'Dubois',
              email: this.DEMO_EMAIL,
              role: 'OSTEOPATH',
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (userError) {
            console.error('Erreur création utilisateur:', userError);
            return;
          }
          user = newUser;
        }

        // Créer le profil ostéopathe démo
        const { data: osteopath, error: osteopathError } = await supabase
          .from('Osteopath')
          .insert({
            authId: userId,
            userId: user.id,
            name: 'Dr. Marie Dubois',
            professional_title: 'Ostéopathe D.O.',
            rpps_number: '10003123456',
            siret: '12345678901234',
            ape_code: '8690F'
          })
          .select()
          .single();

        if (osteopathError) {
          console.error('Erreur création ostéopathe:', osteopathError);
          return;
        }

        console.log('Profil ostéopathe démo créé avec succès:', osteopath.id);
      }
    } catch (error) {
      console.error('Erreur lors de la création des données:', error);
    }
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

// Hook pour la gestion de l'authentification démo
export function useDemoAuth() {
  const loginDemo = async () => {
    const credentials = DemoService.getDemoCredentials();
    
    // Créer le compte s'il n'existe pas
    await DemoService.createDemoAccount();
    
    // Se connecter
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  return {
    loginDemo,
    isLoading: false, // Peut être étendu avec un state de loading
  };
}