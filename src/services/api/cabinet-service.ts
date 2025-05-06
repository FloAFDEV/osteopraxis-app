
import { Cabinet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Fonction pour récupérer tous les cabinets
export const getCabinets = async (): Promise<Cabinet[]> => {
  try {
    const { data, error } = await supabase.from("Cabinet").select("*");

    if (error) {
      throw new Error(error.message);
    }

    // Make sure the returned data matches the Cabinet type
    return (data || []).map(cabinet => ({
      id: cabinet.id,
      name: cabinet.name,
      address: cabinet.address,
      phone: cabinet.phone || "",
      email: cabinet.email || null,
      imageUrl: cabinet.imageUrl || null,
      logoUrl: cabinet.logoUrl || null,
      osteopathId: cabinet.osteopathId,
      createdAt: cabinet.createdAt,
      updatedAt: cabinet.updatedAt,
      city: cabinet.city || "",
      province: cabinet.province || "",
      postalCode: cabinet.postalCode || "",
      country: cabinet.country || ""
    }) as Cabinet);
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

    // Transform data to match Cabinet type
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      phone: data.phone || "",
      email: data.email || null,
      imageUrl: data.imageUrl || null,
      logoUrl: data.logoUrl || null,
      osteopathId: data.osteopathId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      city: data.city || "",
      province: data.province || "",
      postalCode: data.postalCode || "",
      country: data.country || ""
    } as Cabinet;
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
    // Ensure all required fields are present
    if (!cabinetData.name || !cabinetData.address || !cabinetData.osteopathId) {
      throw new Error("Les champs name, address et osteopathId sont requis");
    }

    const { data, error } = await supabase
      .from("Cabinet")
      .insert([cabinetData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Transform to match Cabinet type
    return {
      ...data,
      city: data.city || "",
      province: data.province || "",
      postalCode: data.postalCode || "",
      country: data.country || ""
    } as Cabinet;
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

    // Transform to match Cabinet type
    return {
      ...data,
      city: data.city || "",
      province: data.province || "",
      postalCode: data.postalCode || "",
      country: data.country || ""
    } as Cabinet;
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

    return (data || []).map(cabinet => ({
      id: cabinet.id,
      name: cabinet.name,
      address: cabinet.address,
      phone: cabinet.phone || "",
      email: cabinet.email || null,
      imageUrl: cabinet.imageUrl || null,
      logoUrl: cabinet.logoUrl || null,
      osteopathId: cabinet.osteopathId,
      createdAt: cabinet.createdAt,
      updatedAt: cabinet.updatedAt,
      city: cabinet.city || "",
      province: cabinet.province || "",
      postalCode: cabinet.postalCode || "",
      country: cabinet.country || ""
    }) as Cabinet);
  } catch (error) {
    console.error(`Erreur lors de la récupération des cabinets de l'ostéopathe ${osteopathId}:`, error);
    return [];
  }
};

// Function to get cabinets by user ID
export const getCabinetsByUserId = async (userId: string): Promise<Cabinet[]> => {
  try {
    // First get the osteopath ID for this user
    const { data: osteopathData, error: osteopathError } = await supabase
      .from("Osteopath")
      .select("id")
      .eq("userId", userId)
      .maybeSingle();
      
    if (osteopathError) {
      console.error("Error finding osteopath:", osteopathError);
      throw new Error(osteopathError.message);
    }
    
    if (!osteopathData) {
      console.log("No osteopath found for userId:", userId);
      return [];
    }
    
    // Now get cabinets with this osteopath ID
    return getCabinetsByOsteopathId(osteopathData.id);
  } catch (error) {
    console.error("Exception while searching for cabinets:", error);
    throw error;
  }
};
