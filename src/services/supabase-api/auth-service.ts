import { User, AuthState } from "@/types";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

// Définir le service d'authentification Supabase
export const supabaseAuthService = {
  async register(email: string, password: string, firstName: string, lastName: string): Promise<AuthState> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: firstName,
            lastName: lastName,
            role: "OSTEOPATH"
          }
        }
      });
      
      if (error) throw error;
      
      // L'utilisateur doit confirmer son e-mail avant de pouvoir se connecter
      return {
        user: null,
        isAuthenticated: false,
        token: null,
        message: "Votre compte a été créé. Merci de confirmer votre e-mail pour vous connecter."
      };
    } catch (error) {
      console.error("Erreur d'inscription Supabase:", error);
      throw error;
    }
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
      
    // Ne pas essayer de créer un profil Ostéopathe automatiquement
    // Vérifier simplement si l'utilisateur en a déjà un
    let osteopathId = null;
    try {
      // Recherche d'un profil Ostéopathe déjà existant via User (avec auth_id)
      const { data: userData } = await supabase
        .from("User")
        .select("osteopathId")
        .eq("auth_id", data.user.id)
        .maybeSingle();
          
      if (userData && userData.osteopathId) {
        osteopathId = userData.osteopathId;
        console.log("Profil ostéopathe trouvé:", osteopathId);
      } else {
        // Fallback: chercher directement dans Osteopath si User n'a pas l'info
        const { data: osteopathData } = await supabase
          .from("Osteopath")
          .select("id")
          .eq("userId", data.user.id)
          .maybeSingle();
            
        if (osteopathData) {
          osteopathId = osteopathData.id;
          console.log("Profil ostéopathe trouvé directement:", osteopathId);
        } else {
          console.log("Pas de profil ostéopathe trouvé pour userId:", data.user.id);
        }
      }
    } catch (osteoError) {
      console.error("Erreur lors de la recherche du profil ostéopathe:", osteoError);
    }
      
    const user: User = {
      id: data.user.id,
      email: data.user.email || "",
      firstName: data.user.user_metadata.firstName,
      lastName: data.user.user_metadata.lastName,
      role: (data.user.user_metadata.role || "OSTEOPATH") as any,
      created_at: data.user.created_at,
      updated_at: new Date().toISOString(),
      osteopathId: osteopathId
    };
      
    // L'utilisateur a besoin de configuration s'il n'a pas d'ID d'ostéopathe
    const needsSetup = !user.osteopathId;
    console.log("L'utilisateur a besoin d'une configuration:", needsSetup, "osteopathId:", osteopathId);
      
    // Mettre à jour les métadonnées de l'utilisateur avec l'ID de l'ostéopathe s'il est défini
    if (osteopathId) {
      try {
        await supabase.auth.updateUser({
          data: { osteopathId }
        });
        console.log("Métadonnées utilisateur mises à jour avec osteopathId:", osteopathId);
      } catch (updateError) {
        console.error("Erreur lors de la mise à jour des métadonnées:", updateError);
      }
    }

    return {
      user,
      isAuthenticated: true,
      token: data.session?.access_token || null,
      needsProfileSetup: needsSetup
    };
  },

  async loginWithMagicLink(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    
    if (error) {
      throw error;
    }
  },
  
  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },
  
  async checkAuth(): Promise<AuthState> {
    console.log("Vérification de l'authentification Supabase");
    const { data } = await supabase.auth.getSession();
      
    if (!data.session) {
      console.log("Pas de session Supabase active");
      return {
        user: null,
        isAuthenticated: false,
        token: null
      };
    }
        
    if (!data.session.user) {
      console.log("Session Supabase sans utilisateur");
      return {
        user: null,
        isAuthenticated: false,
        token: null
      };
    }
    
    console.log("Session Supabase trouvée pour:", data.session.user.email);
        
    const user: User = {
      id: data.session.user.id,
      email: data.session.user.email || "",
      firstName: data.session.user.user_metadata.firstName,
      lastName: data.session.user.user_metadata.lastName,
      role: (data.session.user.user_metadata.role || "OSTEOPATH") as any,
      created_at: data.session.user.created_at,
      updated_at: new Date().toISOString(),
      osteopathId: data.session.user.user_metadata.osteopathId
    };
        
    // Vérifier si l'utilisateur a déjà un profil d'ostéopathe via User (avec auth_id)
    let osteopathId = null;
    try {
      const { data: userData } = await supabase
        .from("User")
        .select("osteopathId")
        .eq("auth_id", data.session.user.id)
        .maybeSingle();
            
      if (userData && userData.osteopathId) {
        osteopathId = userData.osteopathId;
        console.log("Profil ostéopathe trouvé via User lors du checkAuth:", osteopathId);
      } else {
        // Fallback: chercher directement dans Osteopath
        const { data: osteopathData } = await supabase
          .from("Osteopath")
          .select("id")
          .eq("userId", data.session.user.id)
          .maybeSingle();
              
        if (osteopathData) {
          osteopathId = osteopathData.id;
          console.log("Profil ostéopathe trouvé directement lors du checkAuth:", osteopathId);
              
          // Mettre à jour la table User si nous avons trouvé un ostéopathId mais qu'il n'était pas dans User
          try {
            const { error: userUpdateError } = await supabase
              .from("User")
              .update({ osteopathId })
              .eq("auth_id", data.session.user.id);
                  
            if (userUpdateError) {
              console.error("Erreur lors de la mise à jour du User avec osteopathId:", userUpdateError);
            } else {
              console.log("User mis à jour avec osteopathId trouvé dans Osteopath");
            }
          } catch (updateError) {
            console.error("Exception lors de la mise à jour du User:", updateError);
          }
        } else {
          console.log("Pas de profil ostéopathe trouvé pour userId:", data.session.user.id);
        }
      }
            
      // Mettre à jour les métadonnées de l'utilisateur si l'ID d'ostéopathe n'y est pas encore
      if (osteopathId && !data.session.user.user_metadata.osteopathId) {
        try {
          await supabase.auth.updateUser({
            data: { osteopathId }
          });
          console.log("Métadonnées utilisateur mises à jour avec osteopathId:", osteopathId);
        } catch (updateError) {
          console.error("Erreur lors de la mise à jour des métadonnées:", updateError);
        }
      }
    } catch (osteoError) {
      console.error("Erreur lors de la recherche du profil ostéopathe:", osteoError);
    }
        
    const updatedUser: User = {
      ...user,
      osteopathId: osteopathId
    };
        
    // L'utilisateur a besoin de configuration s'il n'a pas d'ID d'ostéopathe
    const needsSetup = !osteopathId;
    console.log("L'utilisateur a besoin d'une configuration (checkAuth):", needsSetup, "osteopathId:", osteopathId);
        
    return {
      user: updatedUser,
      isAuthenticated: true,
      token: data.session.access_token,
      needsProfileSetup: needsSetup
    };
  },

  async promoteToAdmin(userId: string): Promise<boolean> {
    try {
      // Appel de la fonction d'edge pour promouvoir l'utilisateur en administrateur
      const { data, error } = await supabase.functions.invoke('promote-to-admin', {
        body: { userId }
      });
      
      if (error) {
        console.error("Erreur lors de la promotion en admin:", error);
        return false;
      }
      
      return data.success === true;
    } catch (error) {
      console.error("Erreur lors de la promotion en admin:", error);
      return false;
    }
  }
};
