import { User, AuthState, Role } from "@/types";
import { supabase } from "./utils";
import { toast } from "sonner";
import { ensureOsteopathProfile } from "./utils/ensureOsteopathProfile";

export const supabaseAuthService = {
  async register(email: string, password: string, firstName: string, lastName: string): Promise<AuthState> {
    console.log("Inscription avec Supabase:", { email, firstName, lastName });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: "OSTEOPATH"  // Par défaut ostéopathe
        },
        emailRedirectTo: window.location.origin // S'assure que la redirection se fait vers votre app
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
    
    // Les triggers SQL s'occuperont de créer l'entrée User et de maintenir les relations
    // On vérifie/créé simplement le profil Ostéopathe si nécessaire
    if (data.session) {
      try {
        const osteopathId = await ensureOsteopathProfile(data.user.id);
        console.log("Profil ostéopathe vérifié/créé lors de l'inscription:", osteopathId);
      } catch (osteoError) {
        console.error("Erreur lors de la création du profil ostéopathe:", osteoError);
      }
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
    
    // Vérifier/Créer un profil Ostéopathe lors de la connexion
    try {
      const osteopathId = await ensureOsteopathProfile(data.user.id);
      console.log("Profil ostéopathe vérifié/créé lors de la connexion:", osteopathId);
    } catch (osteoError) {
      console.error("Erreur lors de la vérification/création du profil ostéopathe:", osteoError);
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
        emailRedirectTo: window.location.origin, // Redirection vers votre app
        data: {
          redirectOnLogin: true // Assure une redirection après connexion
        }
      }
    });
    
    if (error) {
      console.error("Erreur magic link:", error);
      toast.error("Erreur lors de l'envoi du lien de connexion");
      throw error;
    }
    
    toast.success(
      "Un lien de connexion a été envoyé à votre adresse email. Veuillez vérifier votre boîte mail pour vous connecter.", 
      { duration: 6000 }
    );
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
      
      // Le trigger SQL devrait avoir créé l'utilisateur, mais vérifions quand même
      // et récupérons ses informations
      const { data: existingUser, error: userCheckError } = await supabase
        .from("User")
        .select("*")
        .eq("id", data.session.user.id)
        .maybeSingle();
      
      // Si l'utilisateur n'existe pas dans notre table User malgré le trigger (cas rare)
      if (!existingUser && !userCheckError) {
        console.warn("L'utilisateur n'existe pas dans la table User malgré le trigger, tentative de création manuelle");
        const userData = {
          id: data.session.user.id,
          email: data.session.user.email || "",
          first_name: data.session.user.user_metadata?.first_name || null,
          last_name: data.session.user.user_metadata?.last_name || null,
          role: "OSTEOPATH" as Role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from("User")
          .insert([userData]);
        
        if (insertError) {
          console.error("Erreur lors de la création de l'utilisateur manquant:", insertError);
        } else {
          console.log("Utilisateur manquant créé avec succès dans la table User");
        }
      }
      
      // Vérifier/Créer un profil Ostéopathe
      try {
        const osteopathId = await ensureOsteopathProfile(data.session.user.id);
        console.log("Profil ostéopathe vérifié/créé lors du checkAuth:", osteopathId);
      } catch (osteoError) {
        console.error("Erreur lors de la vérification/création du profil ostéopathe:", osteoError);
      }
      
      // Récupérer les informations mises à jour de l'utilisateur
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
