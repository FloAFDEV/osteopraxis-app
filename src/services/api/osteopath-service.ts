import { Osteopath, OsteopathProfile } from "@/types";
import { supabase } from "@/lib/supabase";

export const getOsteopathProfile = async (osteopathId: string): Promise<OsteopathProfile | null> => {
  try {
    // Implement this function to fetch osteopath profile from the database
    // For now, returning a mock profile
    return {
      id: osteopathId,
      firstName: "John",
      lastName: "Doe",
      bio: "Professional osteopath with over 10 years of experience",
      website: "https://example.com",
      linkedin: "https://linkedin.com/in/johndoe",
      facebook: "https://facebook.com/johndoe",
      twitter: "https://twitter.com/johndoe",
      instagram: "https://instagram.com/johndoe",
      youtube: "https://youtube.com/johndoe",
      tiktok: "https://tiktok.com/@johndoe",
      specialties: ["Sports Injuries", "Pediatric Care"],
      services: ["Manual Therapy", "Rehabilitation"],
      education: ["Doctor of Osteopathy, University of Medicine"],
      certifications: ["Certified Sports Medicine Specialist"],
      awards: ["Best Practitioner Award 2022"],
      publications: ["Modern Approaches to Osteopathic Medicine"],
    };
  } catch (error) {
    console.error("Error fetching osteopath profile:", error);
    return null;
  }
};

export const updateOsteopathProfile = async (userId: string, profileData: Partial<OsteopathProfile>): Promise<OsteopathProfile | null> => {
  try {
    // Implement this function to update osteopath profile in the database
    // For now, returning the provided profile data
    return {
      id: userId,
      firstName: profileData.firstName || "",
      lastName: profileData.lastName || "",
      bio: profileData.bio || "",
      website: profileData.website || "",
      linkedin: profileData.linkedin || "",
      facebook: profileData.facebook || "",
      twitter: profileData.twitter || "",
      instagram: profileData.instagram || "",
      youtube: profileData.youtube || "",
      tiktok: profileData.tiktok || "",
      specialties: profileData.specialties || [],
      services: profileData.services || [],
      education: profileData.education || [],
      certifications: profileData.certifications || [],
      awards: profileData.awards || [],
      publications: profileData.publications || [],
    };
  } catch (error) {
    console.error("Error updating osteopath profile:", error);
    return null;
  }
};

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
    console.error(`Error fetching osteopath with ID ${id}:`, error);
    return null;
  }
};

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
    console.error(`Error fetching osteopath with user ID ${userId}:`, error);
    return null;
  }
};

export const createOsteopath = async (data: any): Promise<Osteopath | null> => {
  try {
    const { data: newOsteopath, error } = await supabase
      .from("Osteopath")
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return newOsteopath;
  } catch (error) {
    console.error("Error creating osteopath:", error);
    return null;
  }
};

export const updateOsteopath = async (id: number, data: any): Promise<Osteopath | null> => {
  try {
    const { data: updatedOsteopath, error } = await supabase
      .from("Osteopath")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return updatedOsteopath;
  } catch (error) {
    console.error(`Error updating osteopath with ID ${id}:`, error);
    return null;
  }
};
