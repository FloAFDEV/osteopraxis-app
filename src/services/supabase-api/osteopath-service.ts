import { Osteopath } from "@/types";
import {
  supabase,
  typedData,
  SUPABASE_API_URL,
  SUPABASE_API_KEY,
  removeNullProperties,
} from "./utils";
import { updateOsteopath as updateOsteopathEdge } from "./osteopath/updateOsteopath";

export const supabaseOsteopathService = {
  async getOsteopaths(): Promise<Osteopath[]> {
    const { data, error } = await supabase.from("Osteopath").select("*");
    if (error) throw new Error(error.message);
    return (data || []) as Osteopath[];
  },

  async getOsteopathById(id: number): Promise<Osteopath | undefined> {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        console.log("Osteopath not found with ID:", id);
        return undefined;
      }
      throw new Error(error.message);
    }
    return data as Osteopath;
  },

  /**
   * Recherche l'ostéopathe via la table User en filtrant sur auth_id (UUID Supabase Auth).
   */
  async getOsteopathByUserId(authId: string): Promise<Osteopath | undefined> {
    console.log("Recherche d'un ostéopathe avec authId:", authId);

    if (!authId) {
      throw new Error("authId invalide fourni");
    }

    // Récupérer l'utilisateur avec auth_id
    const { data: users, error: userError } = await supabase
      .from("User")
      .select("osteopathId")
      .eq("auth_id", authId);

    if (userError) {
      console.error("Erreur lors de la récupération de l'utilisateur:", userError);
      throw new Error(userError.message);
    }

    if (!users || users.length === 0) {
      console.log("Aucun utilisateur trouvé avec auth_id:", authId);
      return undefined;
    }

    const osteopathId = users[0].osteopathId;

    if (!osteopathId) {
      console.log("L'utilisateur n'a pas d'osteopathId lié.");
      return undefined;
    }

    // Récupérer l'ostéopathe lié
    return this.getOsteopathById(osteopathId);
  },

  async updateOsteopath(
    id: number,
    osteoData: Partial<Omit<Osteopath, "id" | "createdAt">>
  ): Promise<Osteopath | undefined> {
    try {
      console.log('🔄 Utilisation de la fonction Edge pour updateOsteopath');
      
      // Utiliser la fonction Edge au lieu de l'API directe
      const result = await updateOsteopathEdge(id, osteoData);
      
      return result;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'ostéopathe:", error);
      throw error;
    }
  },

  async createOsteopath(
    data: Omit<Osteopath, "id" | "createdAt" | "updatedAt">
  ): Promise<Osteopath> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("Utilisateur non authentifié");
      }

      const authId = sessionData.session.user.id;

      // Vérifier si un ostéopathe existe déjà
      const existing = await this.getOsteopathByUserId(authId);
      if (existing) {
        console.warn("Un ostéopathe existe déjà pour cet authId :", authId);
        return existing;
      }

      const now = new Date().toISOString();

      const { data: newOsteopath, error } = await supabase
        .from("Osteopath")
        .insert({
          ...data,
          userId: authId, // attention ici userId dans Osteopath est uuid de User
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return newOsteopath as Osteopath;
    } catch (error) {
      console.error("Erreur lors de la création de l'ostéopathe:", error);
      throw error;
    }
  },

  async hasRequiredFields(osteopathId: number): Promise<boolean> {
    try {
      const osteopath = await this.getOsteopathById(osteopathId);
      if (!osteopath) return false;

      return (
        !!osteopath.rpps_number &&
        !!osteopath.siret &&
        !!osteopath.name &&
        !!osteopath.professional_title
      );
    } catch (error) {
      console.error("Erreur lors de la vérification des champs obligatoires:", error);
      return false;
    }
  },
};
