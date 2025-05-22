import { Osteopath } from "@/types";
import {
  supabase,
  typedData,
  SUPABASE_API_URL,
  SUPABASE_API_KEY,
  removeNullProperties,
} from "./utils";

export const supabaseOsteopathService = {
  async getOsteopaths(): Promise<Osteopath[]> {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*");

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

  async getOsteopathByUserId(authId: string): Promise<Osteopath | undefined> {
    console.log("Recherche d'un ostéopathe avec authId:", authId);

    if (!authId) {
      throw new Error("authId invalide fourni");
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("Utilisateur non authentifié");
      }

      const authUserId = sessionData.session.user.id;
      console.log("authId de session:", authUserId);

      const { data, error } = await supabase
        .from("Osteopath")
        .select("*")
        .eq("authId", authUserId)
        .maybeSingle();

      if (error) {
        console.error("Erreur lors de la recherche:", error);
        throw error;
      }

      if (!data) {
        console.log("Aucun ostéopathe trouvé pour authId:", authUserId);
        return undefined;
      }

      return data as Osteopath;
    } catch (error) {
      console.error("Erreur dans getOsteopathByUserId:", error);
      throw error;
    }
  },

  async updateOsteopath(id: number, osteoData: Partial<Omit<Osteopath, 'id' | 'createdAt'>>): Promise<Osteopath | undefined> {
    try {
      const currentOsteopath = await this.getOsteopathById(id);

      if (!currentOsteopath) {
        throw new Error("Ostéopathe non trouvé");
      }

      const authId = currentOsteopath.authId;

      if (!authId) {
        throw new Error("L'ostéopathe n'a pas d'authId valide");
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Utilisateur non authentifié");
      }
      const token = session.access_token;

      const URL_ENDPOINT = `${SUPABASE_API_URL}/rest/v1/Osteopath?id=eq.${id}`;

      const updatePayload = {
        ...removeNullProperties(osteoData),
        name: osteoData.name || currentOsteopath.name,
        authId: authId,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch(URL_ENDPOINT, {
        method: "PUT",
        headers: {
          apikey: SUPABASE_API_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erreur HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data[0];
      if (data && typeof data === "object") return data as Osteopath;

      throw new Error("Aucune donnée retournée lors de la mise à jour");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'ostéopathe:", error);
      throw error;
    }
  },

  async createOsteopath(data: Omit<Osteopath, 'id' | 'createdAt' | 'updatedAt'>): Promise<Osteopath> {
    const now = new Date().toISOString();

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("Utilisateur non authentifié");
      }

      const authId = sessionData.session.user.id;

      const existing = await this.getOsteopathByUserId(authId);
      if (existing) {
        console.warn("Un ostéopathe existe déjà pour cet authId :", authId);
        return existing;
      }

      const { data: newOsteopath, error } = await supabase
        .from("Osteopath")
        .insert({
          ...data,
          authId,
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
        !!osteopath.adeli_number &&
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
