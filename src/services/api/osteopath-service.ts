
// Import necessary types
import { supabase } from "@/integrations/supabase/client";

// Get an osteopath by ID
export const getOsteopathById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching osteopath by ID:", error);
    throw error;
  }
};

// Get an osteopath by user ID
export const getOsteopathByUserId = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("userId", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching osteopath by user ID:", error);
    throw error;
  }
};

// Create a new osteopath
export const createOsteopath = async (osteopathData: any) => {
  try {
    const { data, error } = await supabase
      .from("Osteopath")
      .insert(osteopathData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating osteopath:", error);
    throw error;
  }
};

// Update an osteopath
export const updateOsteopath = async (id: number, osteopathData: any) => {
  try {
    const { data, error } = await supabase
      .from("Osteopath")
      .update(osteopathData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating osteopath:", error);
    throw error;
  }
};

// Get osteopath profile
export const getOsteopathProfile = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching osteopath profile:", error);
    throw error;
  }
};

// Update osteopath profile
export const updateOsteopathProfile = async (id: number, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from("Osteopath")
      .update(profileData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating osteopath profile:", error);
    throw error;
  }
};

// Get all osteopaths
export const getOsteopaths = async () => {
  try {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching osteopaths:", error);
    throw error;
  }
};
