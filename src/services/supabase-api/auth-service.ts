import { AuthState, User, Role } from "@/types";
import { supabase } from "./utils";

export const supabaseAuthService = {
  async register(email: string, password: string, firstName: string, lastName: string): Promise<AuthState> {
    console.log("Inscription avec Supabase:", { email, firstName, lastName });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });
    
    if (error) {
      console.error("Erreur d'inscription Supabase:", error);
      if (error.message.includes("User already registered")) {
        throw new Error("Un compte existe déjà avec cet email");
      }
      throw error;
    }
    
    if (!data.user) {
      throw new Error("Échec lors de la création du compte");
    }
    
    try {
      // Créer l'entrée User associée
      const { error: userError } = await supabase
        .from("User")
        .insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          role: "OSTEOPATH", // Par défaut, tous les nouveaux utilisateurs sont des ostéopathes
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (userError) {
        console.error("Erreur lors de la création du profil utilisateur:", userError);
      }
    } catch (insertError) {
      console.error("Erreur lors de la création du profil utilisateur:", insertError);
    }
    
    // Si email confirmation est requise, retourner un état spécial avec un message
    if (data.session === null) {
      // Email confirmation required
      return {
        user: {
          id: data.user.id,
          email: data.user.email || "",
          first_name: firstName,
          last_name: lastName,
          role: "OSTEOPATH" as Role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          osteopathId: null
        },
        isAuthenticated: false,
        token: null,
        message: "Veuillez confirmer votre email avant de vous connecter. Un lien de confirmation a été envoyé à votre adresse email."
      };
    }
    
    // Si inscription réussie et pas de confirmation d'email requise, connecter l'utilisateur
    return {
      user: {
        id: data.user.id,
        email: data.user.email || "",
        first_name: firstName,
        last_name: lastName,
        role: "OSTEOPATH" as Role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        osteopathId: null
      },
      isAuthenticated: true,
      token: data.session?.access_token || null
    };
  },
  
  async login(email: string, password: string): Promise<AuthState> {
    console.log("Connexion avec Supabase:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("Erreur de connexion Supabase:", error);
      throw error;
    }
    
    if (!data.user) {
      throw new Error("Identifiants incorrects");
    }
    
    // Récupérer les informations supplémentaires de l'utilisateur depuis la table User
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("*")
      .eq("id", data.user.id)
      .single();
    
    if (userError) {
      console.error("Erreur lors de la récupération des données utilisateur:", userError);
    }
    
    const typedUserData = userData as any;
    
    const user: User = typedUserData ? {
      id: data.user.id,
      email: data.user.email || "",
      first_name: typedUserData.first_name,
      last_name: typedUserData.last_name,
      role: typedUserData.role,
      created_at: typedUserData.created_at,
      updated_at: typedUserData.updated_at,
      osteopathId: typedUserData.osteopathId
    } : {
      id: data.user.id,
      email: data.user.email || "",
      first_name: null,
      last_name: null,
      role: "OSTEOPATH" as Role, // Valeur par défaut
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      osteopathId: null
    };
    
    const authState: AuthState = {
      user,
      isAuthenticated: true,
      token: data.session?.access_token || null
    };
    
    localStorage.setItem("authState", JSON.stringify(authState));
    
    return authState;
  },
  
  async loginWithMagicLink(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    
    if (error) throw new Error(error.message);
  },
  
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Erreur lors de la déconnexion:", error);
    
    localStorage.removeItem("authState");
  },
  
  async checkAuth(): Promise<AuthState> {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        return {
          user: null,
          isAuthenticated: false,
          token: null
        };
      }
      
      // Récupérer les informations supplémentaires de l'utilisateur depuis la table User
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("*")
        .eq("id", data.session.user.id)
        .maybeSingle();
      
      if (userError) {
        console.error("Erreur lors de la récupération des données utilisateur:", userError);
      }
      
      const typedUserData = userData as any;
      
      const user: User = typedUserData ? {
        id: data.session.user.id,
        email: data.session.user.email || "",
        first_name: typedUserData.first_name,
        last_name: typedUserData.last_name,
        role: typedUserData.role,
        created_at: typedUserData.created_at,
        updated_at: typedUserData.updated_at,
        osteopathId: typedUserData.osteopathId
      } : {
        id: data.session.user.id,
        email: data.session.user.email || "",
        first_name: null,
        last_name: null,
        role: "OSTEOPATH" as Role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        osteopathId: null
      };
      
      return {
        user,
        isAuthenticated: true,
        token: data.session.access_token
      };
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
      return {
        user: null,
        isAuthenticated: false,
        token: null
      };
    }
  },

  async promoteToAdmin(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from("User")
      .update({ role: "ADMIN" })
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return true;
  }
};
