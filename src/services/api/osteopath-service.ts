
import { Osteopath } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Fonction pour récupérer un ostéopathe par ID
export const getOsteopathById = async (id: number): Promise<Osteopath | null> => {
  try {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'ostéopathe ${id}:`, error);
    return null;
  }
};

// Function to get all osteopaths
export const getOsteopaths = async (): Promise<Osteopath[]> => {
  try {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des ostéopathes:", error);
    return [];
  }
};

// Fonction pour récupérer un ostéopathe par ID d'utilisateur
export const getOsteopathByUserId = async (userId: string): Promise<Osteopath | null> => {
  try {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("userId", userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'ostéopathe pour l'utilisateur ${userId}:`, error);
    return null;
  }
};

// Fonction pour créer un ostéopathe
export const createOsteopath = async (data: any): Promise<Osteopath> => {
  try {
    const { data: createdOsteopath, error } = await supabase
      .from("Osteopath")
      .insert([data])
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return createdOsteopath;
  } catch (error) {
    console.error("Erreur lors de la création de l'ostéopathe:", error);
    throw error;
  }
};

// Fonction pour mettre à jour un ostéopathe
export const updateOsteopath = async (id: number, data: Partial<Osteopath>): Promise<Osteopath> => {
  try {
    const { data: updatedOsteopath, error } = await supabase
      .from("Osteopath")
      .update(data)
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return updatedOsteopath;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'ostéopathe ${id}:`, error);
    throw error;
  }
};

// Fonction pour récupérer le profil d'un ostéopathe
export const getOsteopathProfile = async (userId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from("User")
      .select("*, Osteopath(*)")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      osteopathId: data.osteopathId,
      osteopathDetails: data.Osteopath
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération du profil de l'ostéopathe pour l'utilisateur ${userId}:`, error);
    return null;
  }
};

// Function to update an osteopath profile
export const updateOsteopathProfile = async (userId: string, profileData: any): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from("User")
      .update({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        // Add other user fields as necessary
      })
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // If there's osteopath specific data to update and osteopathId exists
    if (profileData.osteopathId) {
      const { error: osteopathError } = await supabase
        .from("Osteopath")
        .update({
          name: `${profileData.firstName} ${profileData.lastName}`,
          professional_title: profileData.professionalTitle,
          adeli_number: profileData.adeliNumber,
          siret: profileData.siret,
          ape_code: profileData.apeCode,
        })
        .eq("id", profileData.osteopathId);

      if (osteopathError) {
        throw new Error(osteopathError.message);
      }
    }

    return { success: true, userId };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du profil de l'ostéopathe ${userId}:`, error);
    throw error;
  }
};
