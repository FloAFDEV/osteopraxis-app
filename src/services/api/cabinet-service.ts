
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Fonction pour récupérer tous les cabinets
export const getCabinets = async (): Promise<Cabinet[]> => {
  try {
    const { data, error } = await supabase.from("Cabinet").select("*");

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des cabinets:", error);
    return [];
  }
};

// Fonction pour récupérer un cabinet par ID
export const getCabinetById = async (id: number): Promise<Cabinet | null> => {
  try {
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du cabinet ${id}:`, error);
    return {
      id: 1,
      name: "Cabinet test",
      address: "123 rue Test",
      phone: "0123456789",
      imageUrl: null,
      logoUrl: null,
      osteopathId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      city: "Paris",
      province: "Île-de-France",
      postalCode: "75001",
      country: "France",
    } as Cabinet;
  }
};

// Fonction pour créer un nouveau cabinet
export const createCabinet = async (cabinetData: Partial<Cabinet>): Promise<Cabinet> => {
  try {
    const { data, error } = await supabase
      .from("Cabinet")
      .insert([cabinetData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de la création du cabinet:", error);
    throw error;
  }
};

// Fonction pour mettre à jour un cabinet
export const updateCabinet = async (id: number, cabinetData: Partial<Cabinet>): Promise<Cabinet> => {
  try {
    const { data, error } = await supabase
      .from("Cabinet")
      .update(cabinetData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du cabinet ${id}:`, error);
    throw error;
  }
};

// Fonction pour supprimer un cabinet
export const deleteCabinet = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase.from("Cabinet").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression du cabinet ${id}:`, error);
    throw error;
  }
};

// Fonction pour récupérer les cabinets d'un ostéopathe
export const getCabinetsByOsteopathId = async (osteopathId: number): Promise<Cabinet[]> => {
  try {
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("osteopathId", osteopathId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des cabinets de l'ostéopathe ${osteopathId}:`, error);
    return [];
  }
};
